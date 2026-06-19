import mongoose from "mongoose";

import { connectDB } from "@/lib/db.server";
import { generateReference } from "@/lib/format";
import { Investment } from "@/lib/models/investment.model.server";
import { Transaction } from "@/lib/models/transaction.model.server";
import { Wallet, type WalletDocument } from "@/lib/models/wallet.model.server";

export async function getOrCreateWallet(userId: string): Promise<WalletDocument> {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(userId);
  let wallet = await Wallet.findOne({ userId: oid });
  if (!wallet) {
    wallet = await Wallet.create({ userId: oid, balance: 0, lockedBalance: 0 });
  }
  return wallet;
}

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
  const existing = await Transaction.findOne({ reference: params.reference });
  if (existing?.status === "completed") return { wallet, transaction: existing };

  wallet.balance += params.amount;
  await wallet.save();

  const transaction = await Transaction.findOneAndUpdate(
    { reference: params.reference },
    {
      walletId: wallet._id,
      userId: wallet.userId,
      type: params.type,
      amount: params.amount,
      balanceAfter: wallet.balance,
      status: "completed",
      externalReference: params.externalReference,
      metadata: params.metadata,
    },
    { upsert: true, new: true },
  );

  return { wallet, transaction: transaction! };
}

export async function debitWalletForInvestment(params: {
  userId: string;
  amount: number;
  investmentId: mongoose.Types.ObjectId;
  reference: string;
}) {
  const wallet = await getOrCreateWallet(params.userId);
  if (wallet.balance < params.amount) {
    throw new Error("Insufficient wallet balance");
  }

  wallet.balance -= params.amount;
  await wallet.save();

  const transaction = await Transaction.create({
    walletId: wallet._id,
    userId: wallet.userId,
    type: "investment",
    amount: -params.amount,
    balanceAfter: wallet.balance,
    status: "completed",
    reference: params.reference,
    investmentId: params.investmentId,
  });

  return { wallet, transaction };
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
  const available = wallet.balance - wallet.lockedBalance;
  if (params.amount > available) {
    throw new Error("Insufficient available balance");
  }

  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");
  const pendingCount = await Withdrawal.countDocuments({ userId: params.userId, status: "pending" });
  if (pendingCount > 0) {
    throw new Error("You already have a pending withdrawal request.");
  }

  wallet.lockedBalance += params.amount;
  await wallet.save();

  const withdrawal = await Withdrawal.create({
    userId: params.userId,
    amount: params.amount,
    bankName: params.bankName,
    accountNumber: params.accountNumber,
    accountName: params.accountName,
    reference: params.reference,
    status: "pending",
  });

  return { wallet, withdrawal };
}

export async function completeWithdrawal(params: {
  withdrawalId: string;
  adminUserId: string;
  action: "approve" | "reject";
  adminNote?: string;
}) {
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");

  const withdrawal = await Withdrawal.findById(params.withdrawalId);
  if (!withdrawal || withdrawal.status !== "pending") {
    throw new Error("Withdrawal request not found or already processed.");
  }

  const wallet = await getOrCreateWallet(withdrawal.userId.toString());
  if (wallet.lockedBalance < withdrawal.amount) {
    throw new Error("Wallet lock mismatch. Contact support.");
  }

  if (params.action === "reject") {
    wallet.lockedBalance -= withdrawal.amount;
    await wallet.save();
    withdrawal.status = "rejected";
    withdrawal.adminNote = params.adminNote?.trim() || "Withdrawal could not be processed.";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = new mongoose.Types.ObjectId(params.adminUserId);
    await withdrawal.save();

    const { createNotification, notifySafe } = await import("@/lib/notifications.server");
    const { formatNaira } = await import("@/lib/format");
    await notifySafe(
      () =>
        createNotification({
          userId: withdrawal.userId.toString(),
          type: "withdrawal",
          title: "Withdrawal declined",
          body: `Your ${formatNaira(withdrawal.amount)} withdrawal request was not approved.`,
          link: "/app/wallet",
        }),
      "withdrawal-reject-notification",
    );

    const { notifySmsSafe, sendWithdrawalRejectedSms } = await import("@/lib/sms.server");
    await notifySmsSafe(
      () => sendWithdrawalRejectedSms(withdrawal.userId.toString(), withdrawal.amount),
      "withdrawal-reject-sms",
    );

    return { withdrawal };
  }

  if (wallet.balance < withdrawal.amount) {
    throw new Error("Insufficient wallet balance.");
  }

  wallet.balance -= withdrawal.amount;
  wallet.lockedBalance -= withdrawal.amount;
  await wallet.save();

  const txnRef = newTxnReference();
  await Transaction.create({
    walletId: wallet._id,
    userId: wallet.userId,
    type: "withdrawal",
    amount: -withdrawal.amount,
    balanceAfter: wallet.balance,
    status: "completed",
    reference: txnRef,
    metadata: { withdrawalId: withdrawal._id.toString(), withdrawalReference: withdrawal.reference },
  });

  withdrawal.status = "completed";
  withdrawal.adminNote = params.adminNote?.trim();
  withdrawal.processedAt = new Date();
  withdrawal.processedBy = new mongoose.Types.ObjectId(params.adminUserId);
  await withdrawal.save();

  const { createNotification, notifySafe } = await import("@/lib/notifications.server");
  const { formatNaira } = await import("@/lib/format");
  await notifySafe(
    () =>
      createNotification({
        userId: withdrawal.userId.toString(),
        type: "withdrawal",
        title: "Withdrawal completed",
        body: `${formatNaira(withdrawal.amount)} has been sent to your bank account.`,
        link: "/app/wallet",
      }),
    "withdrawal-complete-notification",
  );

  const { notifySmsSafe, sendWithdrawalApprovedSms } = await import("@/lib/sms.server");
  await notifySmsSafe(
    () => sendWithdrawalApprovedSms(withdrawal.userId.toString(), withdrawal.amount),
    "withdrawal-complete-sms",
  );

  return { withdrawal, wallet };
}
