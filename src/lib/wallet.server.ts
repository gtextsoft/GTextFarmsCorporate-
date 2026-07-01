import mongoose from "mongoose";

import { connectDB } from "@/lib/db.server";
import { generateReference } from "@/lib/format";
import { Investment } from "@/lib/models/investment.model.server";
import { Transaction, type TransactionDocument } from "@/lib/models/transaction.model.server";
import { Wallet, type WalletDocument } from "@/lib/models/wallet.model.server";
import type { WithdrawalDocument } from "@/lib/models/withdrawal.model.server";

function isDuplicateKeyError(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { code?: number }).code === 11000);
}

export async function getOrCreateWallet(userId: string): Promise<WalletDocument> {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(userId);
  try {
    return await Wallet.findOneAndUpdate(
      { userId: oid },
      { $setOnInsert: { balance: 0, lockedBalance: 0, currency: "NGN" } },
      { upsert: true, new: true },
    );
  } catch (err) {
    // Concurrent first-time upserts can race on the unique userId index.
    if (isDuplicateKeyError(err)) {
      const wallet = await Wallet.findOne({ userId: oid });
      if (wallet) return wallet;
    }
    throw err;
  }
}

/**
 * Credit a wallet idempotently. The unique `reference` on the ledger row is the
 * idempotency key: the balance `$inc` and the ledger insert happen in a single
 * transaction, so a retried/concurrent delivery with the same reference aborts
 * with a duplicate-key (rolling back the `$inc`) and is treated as a no-op.
 */
export async function creditWallet(params: {
  userId: string;
  amount: number;
  type: "deposit" | "return_payout" | "refund" | "adjustment";
  reference: string;
  externalReference?: string;
  metadata?: Record<string, unknown>;
}) {
  if (params.amount <= 0) throw new Error("Amount must be positive");

  const wallet = await getOrCreateWallet(params.userId);

  // Fast path: already processed (avoids opening a transaction for retries).
  const existing = await Transaction.findOne({ reference: params.reference });
  if (existing?.status === "completed") return { wallet, transaction: existing };

  const session = await mongoose.startSession();
  try {
    let ledger: TransactionDocument | undefined;
    await session.withTransaction(async () => {
      const updated = await Wallet.findOneAndUpdate(
        { userId: wallet.userId },
        { $inc: { balance: params.amount } },
        { new: true, session },
      );
      if (!updated) throw new Error("Wallet not found");
      const [txn] = await Transaction.create(
        [
          {
            walletId: updated._id,
            userId: updated.userId,
            type: params.type,
            amount: params.amount,
            balanceAfter: updated.balance,
            status: "completed",
            reference: params.reference,
            externalReference: params.externalReference,
            metadata: params.metadata,
          },
        ],
        { session },
      );
      ledger = txn;
    });
    const finalWallet = await Wallet.findById(wallet._id);
    return { wallet: finalWallet ?? wallet, transaction: ledger! };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      // A concurrent delivery already wrote this reference; our $inc rolled back.
      const transaction = await Transaction.findOne({ reference: params.reference });
      return { wallet: await getOrCreateWallet(params.userId), transaction: transaction! };
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

export async function getWalletSummary(userId: string) {
  await connectDB();
  const wallet = await getOrCreateWallet(userId);

  const [totalInvested, activeInvestments, transactions] = await Promise.all([
    Investment.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Investment.countDocuments({
      userId,
      status: { $in: ["confirmed", "active"] },
    }),
    Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  return {
    balance: wallet.balance,
    lockedBalance: wallet.lockedBalance,
    availableBalance: wallet.balance - wallet.lockedBalance,
    totalInvested: totalInvested[0]?.total ?? 0,
    activeInvestments,
    transactions: transactions.map((t) => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      status: t.status,
      reference: t.reference,
      createdAt: t.createdAt?.toISOString() ?? new Date().toISOString(),
    })),
  };
}

export function newTxnReference() {
  return generateReference("TXN");
}

export async function requestWithdrawal(params: {
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
}) {
  if (params.amount < 1000) {
    throw new Error("Minimum withdrawal is ₦1,000");
  }

  const wallet = await getOrCreateWallet(params.userId);
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");

  // Atomically lock the funds only if enough is available. The conditional
  // filter (not the schema `min`, which does not run on `$inc`) is the guard.
  const locked = await Wallet.findOneAndUpdate(
    {
      userId: wallet.userId,
      $expr: { $gte: [{ $subtract: ["$balance", "$lockedBalance"] }, params.amount] },
    },
    { $inc: { lockedBalance: params.amount } },
    { new: true },
  );
  if (!locked) {
    throw new Error("Insufficient available balance");
  }

  try {
    const withdrawal = await Withdrawal.create({
      userId: params.userId,
      amount: params.amount,
      bankName: params.bankName,
      accountNumber: params.accountNumber,
      accountName: params.accountName,
      reference: params.reference,
      status: "pending",
    });
    return { wallet: locked, withdrawal };
  } catch (err) {
    // Release the lock if the withdrawal could not be created.
    await Wallet.updateOne({ userId: wallet.userId }, { $inc: { lockedBalance: -params.amount } });
    // The partial unique index on { userId, status: "pending" } enforces one
    // pending withdrawal per user; a concurrent request hits a duplicate key.
    if (isDuplicateKeyError(err)) {
      throw new Error("You already have a pending withdrawal request.");
    }
    throw err;
  }
}

export async function completeWithdrawal(params: {
  withdrawalId: string;
  adminUserId: string;
  action: "approve" | "reject";
  adminNote?: string;
}) {
  await connectDB();
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");

  const session = await mongoose.startSession();
  let withdrawal: WithdrawalDocument | undefined;
  try {
    await session.withTransaction(async () => {
      // Atomically claim the pending request — only one admin/action wins.
      const claimed = await Withdrawal.findOneAndUpdate(
        { _id: params.withdrawalId, status: "pending" },
        {
          $set: {
            status: params.action === "approve" ? "completed" : "rejected",
            adminNote:
              params.action === "reject"
                ? params.adminNote?.trim() || "Withdrawal could not be processed."
                : params.adminNote?.trim(),
            processedAt: new Date(),
            processedBy: new mongoose.Types.ObjectId(params.adminUserId),
          },
        },
        { new: true, session },
      );
      if (!claimed) {
        throw new Error("Withdrawal request not found or already processed.");
      }
      withdrawal = claimed;

      if (params.action === "reject") {
        await Wallet.updateOne(
          { userId: claimed.userId },
          { $inc: { lockedBalance: -claimed.amount } },
          { session },
        );
        return;
      }

      // Approve: atomically debit both balances (guarded against underflow).
      const debited = await Wallet.findOneAndUpdate(
        {
          userId: claimed.userId,
          balance: { $gte: claimed.amount },
          lockedBalance: { $gte: claimed.amount },
        },
        { $inc: { balance: -claimed.amount, lockedBalance: -claimed.amount } },
        { new: true, session },
      );
      if (!debited) {
        throw new Error("Wallet lock mismatch. Contact support.");
      }
      await Transaction.create(
        [
          {
            walletId: debited._id,
            userId: debited.userId,
            type: "withdrawal",
            amount: -claimed.amount,
            balanceAfter: debited.balance,
            status: "completed",
            reference: newTxnReference(),
            metadata: {
              withdrawalId: claimed._id.toString(),
              withdrawalReference: claimed.reference,
            },
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  // Side effects run only after the transaction commits.
  const result = withdrawal!;
  const { createNotification, notifySafe } = await import("@/lib/notifications.server");
  const { formatNaira } = await import("@/lib/format");
  const { notifySmsSafe, sendWithdrawalRejectedSms, sendWithdrawalApprovedSms } = await import(
    "@/lib/sms.server"
  );

  if (params.action === "reject") {
    await notifySafe(
      () =>
        createNotification({
          userId: result.userId.toString(),
          type: "withdrawal",
          title: "Withdrawal declined",
          body: `Your ${formatNaira(result.amount)} withdrawal request was not approved.`,
          link: "/app/wallet",
        }),
      "withdrawal-reject-notification",
    );
    await notifySmsSafe(
      () => sendWithdrawalRejectedSms(result.userId.toString(), result.amount),
      "withdrawal-reject-sms",
    );
    return { withdrawal: result };
  }

  await notifySafe(
    () =>
      createNotification({
        userId: result.userId.toString(),
        type: "withdrawal",
        title: "Withdrawal completed",
        body: `${formatNaira(result.amount)} has been sent to your bank account.`,
        link: "/app/wallet",
      }),
    "withdrawal-complete-notification",
  );
  await notifySmsSafe(
    () => sendWithdrawalApprovedSms(result.userId.toString(), result.amount),
    "withdrawal-complete-sms",
  );
  return { withdrawal: result };
}
