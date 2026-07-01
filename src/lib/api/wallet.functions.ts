import { createServerFn } from "@tanstack/react-start";
import type { Types } from "mongoose";
import { z } from "zod";

import { formatNaira, generateReference } from "@/lib/format";
import { withDatabase } from "@/lib/with-database";

async function requireVerifiedInvestor() {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };
  if (session.data.kycStatus !== "verified") {
    return { error: "Complete KYC verification before investing." as const };
  }
  return { userId: session.data.userId, email: session.data.email };
}

export const getWalletSummaryFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  const { getWalletSummary } = await import("@/lib/wallet.server");
  try {
    return await getWalletSummary(session.data.userId);
  } catch {
    return { error: "Could not load wallet. Check MongoDB connection." as const };
  }
});

export const getDashboardSummaryFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  const userId = session.data.userId;
  try {
    const mongoose = (await import("mongoose")).default;
    const { getWalletSummary } = await import("@/lib/wallet.server");
    const { Transaction } = await import("@/lib/models/transaction.model.server");
    const { Investment } = await import("@/lib/models/investment.model.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");

    const userOid = new mongoose.Types.ObjectId(userId);
    const [summary, returnsAgg, activeInvestments] = await Promise.all([
      getWalletSummary(userId),
      Transaction.aggregate([
        { $match: { userId: userOid, type: "return_payout", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Investment.find({ userId, status: { $in: ["confirmed", "active"] } })
        .select("amount expectedReturnMin cycleId")
        .lean(),
    ]);

    // Projected monthly profit = each active investment's expected profit spread
    // evenly across its cycle's duration.
    let projectedMonthly = 0;
    if (activeInvestments.length > 0) {
      const cycleIds = [...new Set(activeInvestments.map((inv) => String(inv.cycleId)))];
      const cycles = await Cycle.find({ _id: { $in: cycleIds } })
        .select("durationMonths")
        .lean();
      const monthsByCycle = new Map(cycles.map((c) => [String(c._id), c.durationMonths ?? 0]));
      for (const inv of activeInvestments) {
        const months = monthsByCycle.get(String(inv.cycleId)) ?? 0;
        const profit = (inv.expectedReturnMin ?? 0) - inv.amount;
        if (months > 0 && profit > 0) projectedMonthly += profit / months;
      }
      projectedMonthly = Math.round(projectedMonthly);
    }

    return {
      balance: summary.balance,
      availableBalance: summary.availableBalance,
      totalInvested: summary.totalInvested,
      activeInvestments: summary.activeInvestments,
      totalReturns: returnsAgg[0]?.total ?? 0,
      projectedMonthly,
    };
  } catch {
    return {
      balance: 0,
      availableBalance: 0,
      totalInvested: 0,
      activeInvestments: 0,
      totalReturns: 0,
      projectedMonthly: 0,
    };
  }
});

const depositSchema = z.object({
  amount: z.number().min(1000, "Minimum deposit is ₦1,000"),
});

export const initializeDepositFn = createServerFn({ method: "POST" })
  .validator(depositSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { Transaction } = await import("@/lib/models/transaction.model.server");
    const { getOrCreateWallet, newTxnReference } = await import("@/lib/wallet.server");
    const {
      getPaystackCallbackUrl,
      initializePaystackTransaction,
    } = await import("@/lib/paystack.server");

    await connectDB();
    const user = await User.findById(session.data.userId);
    if (!user) return { error: "User not found" as const };

    const reference = newTxnReference();
    const wallet = await getOrCreateWallet(session.data.userId);

    await Transaction.create({
      walletId: wallet._id,
      userId: wallet.userId,
      type: "deposit",
      amount: data.amount,
      balanceAfter: wallet.balance,
      status: "pending",
      reference,
      metadata: { amountNaira: data.amount },
    });

    try {
      const paystack = await initializePaystackTransaction({
        email: user.email,
        amountNaira: data.amount,
        reference,
        callbackUrl: `${getPaystackCallbackUrl()}?deposit=success`,
        metadata: { userId: session.data.userId },
      });

      return {
        authorizationUrl: paystack.authorization_url,
        reference: paystack.reference,
      };
    } catch (err) {
      await Transaction.updateOne({ reference }, { status: "failed" });
      return {
        error: err instanceof Error ? err.message : "Payment initialization failed",
      };
    }
  });

const investSchema = z.object({
  cycleSlug: z.string().min(1),
  amount: z.number().min(1),
});

export const confirmInvestmentFn = createServerFn({ method: "POST" })
  .validator(investSchema)
  .handler(async ({ data }) => {
    const auth = await requireVerifiedInvestor();
    if ("error" in auth) return { error: auth.error };

    const mongoose = (await import("mongoose")).default;
    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const { Investment } = await import("@/lib/models/investment.model.server");
    const { Wallet } = await import("@/lib/models/wallet.model.server");
    const { Transaction } = await import("@/lib/models/transaction.model.server");
    const { getOrCreateWallet, newTxnReference } = await import("@/lib/wallet.server");

    await connectDB();
    const cycle = await Cycle.findOne({ slug: data.cycleSlug, published: true, status: "funding" });
    if (!cycle) return { error: "This cycle is not open for investment." };

    const min = cycle.minimumInvestmentAmount ?? 50_000;
    if (data.amount < min) {
      return { error: `Minimum investment is ₦${min.toLocaleString()}.` };
    }

    const remaining = (cycle.targetAmount ?? 0) - (cycle.raisedAmount ?? 0);
    if (data.amount > remaining) {
      return { error: `Only ₦${remaining.toLocaleString()} remaining in this cycle.` };
    }

    const existing = await Investment.findOne({ userId: auth.userId, cycleId: cycle._id });
    if (existing) return { error: "You have already invested in this cycle." };

    const roiMin = cycle.roiMin ?? 0;
    const roiMax = cycle.roiMax ?? 0;
    const expectedReturnMin = Math.round(data.amount * (1 + roiMin / 100));
    const expectedReturnMax = Math.round(data.amount * (1 + roiMax / 100));
    const certificateNumber = generateReference("INV");
    const txnRef = newTxnReference();

    // Ensure the wallet exists before the transaction (avoids an upsert race inside it).
    await getOrCreateWallet(auth.userId);

    const userOid = new mongoose.Types.ObjectId(auth.userId);
    const session = await mongoose.startSession();
    let investmentId: Types.ObjectId | undefined;
    try {
      await session.withTransaction(async () => {
        // Atomic debit — the conditional balance filter (schema `min` does not run
        // on `$inc`) is what prevents double-spend and negative balances.
        const debited = await Wallet.findOneAndUpdate(
          { userId: userOid, balance: { $gte: data.amount } },
          { $inc: { balance: -data.amount } },
          { new: true, session },
        );
        if (!debited) throw new Error("INSUFFICIENT_FUNDS");

        // Atomic cycle funding — rejects any amount that would exceed the target.
        const fundedCycle = await Cycle.findOneAndUpdate(
          {
            _id: cycle._id,
            status: "funding",
            $expr: { $lte: [{ $add: ["$raisedAmount", data.amount] }, "$targetAmount"] },
          },
          { $inc: { raisedAmount: data.amount } },
          { new: true, session },
        );
        if (!fundedCycle) throw new Error("CYCLE_UNAVAILABLE");

        // Keep derived display fields consistent with the new raisedAmount.
        const newRaised = fundedCycle.raisedAmount ?? 0;
        const filled = fundedCycle.targetAmount
          ? Math.min(100, Math.round((newRaised / fundedCycle.targetAmount) * 100))
          : fundedCycle.filled;
        await Cycle.updateOne(
          { _id: cycle._id },
          { $set: { filled, raised: `₦${(newRaised / 1_000_000).toFixed(1)}M` } },
          { session },
        );

        const [created] = await Investment.create(
          [
            {
              userId: auth.userId,
              cycleId: cycle._id,
              cycleSlug: cycle.slug,
              cycleTitle: cycle.title,
              amount: data.amount,
              status: "confirmed",
              certificateNumber,
              expectedReturnMin,
              expectedReturnMax,
              investedAt: new Date(),
            },
          ],
          { session },
        );
        investmentId = created._id;

        await Transaction.create(
          [
            {
              walletId: debited._id,
              userId: debited.userId,
              type: "investment",
              amount: -data.amount,
              balanceAfter: debited.balance,
              status: "completed",
              reference: txnRef,
              investmentId: created._id,
            },
          ],
          { session },
        );
      });
    } catch (err) {
      const code = (err as { code?: number })?.code;
      const message = err instanceof Error ? err.message : "";
      if (message === "INSUFFICIENT_FUNDS") {
        return { error: "Insufficient wallet balance. Fund your wallet first." };
      }
      if (message === "CYCLE_UNAVAILABLE") {
        return { error: "This cycle is full or no longer open for investment." };
      }
      if (code === 11000) {
        return { error: "You have already invested in this cycle." };
      }
      return { error: message || "Investment failed" };
    } finally {
      await session.endSession();
    }

    // Side effects run only after the transaction commits.
    const newInvestmentId = investmentId!.toString();
    const { User } = await import("@/lib/models/user.model.server");
    const { writeAuditLog } = await import("@/lib/audit.server");
    const { notifySafe, sendInvestmentConfirmedEmail } = await import("@/lib/email.server");

    const investor = await User.findById(auth.userId);
    if (investor) {
      await notifySafe(
        () =>
          sendInvestmentConfirmedEmail(
            investor.email,
            investor.fullName,
            cycle.title,
            data.amount,
            certificateNumber,
          ),
        "investment-confirmed",
      );
      const { createNotification, notifySafe: notify } = await import("@/lib/notifications.server");
      await notify(
        () =>
          createNotification({
            userId: auth.userId,
            type: "investment",
            title: "Investment confirmed",
            body: `Your ${formatNaira(data.amount)} investment in ${cycle.title} is confirmed.`,
            link: `/app/investments/${newInvestmentId}/certificate`,
            metadata: { certificateNumber, cycleSlug: cycle.slug },
          }),
        "investment-notification",
      );
    }

    await writeAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email,
      action: "investment.create",
      entityType: "investment",
      entityId: newInvestmentId,
      details: {
        cycleSlug: cycle.slug,
        amount: data.amount,
        certificateNumber,
      },
    });

    return {
      success: true as const,
      investment: {
        id: newInvestmentId,
        certificateNumber,
        amount: data.amount,
        cycleTitle: cycle.title,
        expectedReturnMin,
        expectedReturnMax,
      },
    };
  });

export const getMyInvestmentsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Investment } = await import("@/lib/models/investment.model.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const investments = await Investment.find({ userId: session.data.userId })
      .sort({ investedAt: -1 })
      .lean();

    const cycleIds = [...new Set(investments.map((inv) => inv.cycleId.toString()))];
    const cycles = await Cycle.find({ _id: { $in: cycleIds } }).lean();
    const cycleById = new Map(cycles.map((c) => [c._id.toString(), c]));

    return investments.map((inv) => {
      const cycle = cycleById.get(inv.cycleId.toString());
      return {
        id: inv._id.toString(),
        cycleSlug: inv.cycleSlug,
        cycleTitle: inv.cycleTitle,
        amount: inv.amount,
        status: inv.status,
        certificateNumber: inv.certificateNumber,
        expectedReturnMin: inv.expectedReturnMin ?? 0,
        expectedReturnMax: inv.expectedReturnMax ?? 0,
        actualReturn: inv.actualReturn,
        investedAt: inv.investedAt?.toISOString() ?? "",
        completedAt: inv.completedAt?.toISOString() ?? "",
        cycleStatus: cycle?.status ?? "active",
        farmName: cycle?.farmName ?? "",
        location: cycle?.location ?? "",
        duration: cycle?.duration ?? "",
        roi: cycle?.roi ?? "",
      };
    });
  }, []);
});

export const getInvestmentDetailFn = createServerFn({ method: "GET" })
  .validator(z.object({ investmentId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };

    return withDatabase(async () => {
      const { Investment } = await import("@/lib/models/investment.model.server");
      const { User } = await import("@/lib/models/user.model.server");
      const { Cycle } = await import("@/lib/models/cycle.model.server");

      const inv = await Investment.findOne({
        _id: data.investmentId,
        userId: session.data.userId,
      }).lean();
      if (!inv) return { error: "Not found." as const };

      const [user, cycle] = await Promise.all([
        User.findById(session.data.userId).lean(),
        Cycle.findById(inv.cycleId).lean(),
      ]);

      return {
        id: inv._id.toString(),
        cycleSlug: inv.cycleSlug,
        certificateNumber: inv.certificateNumber ?? "",
        investorName: user?.fullName ?? "",
        investorEmail: user?.email ?? "",
        cycleTitle: inv.cycleTitle,
        amount: inv.amount,
        expectedReturnMin: inv.expectedReturnMin ?? 0,
        expectedReturnMax: inv.expectedReturnMax ?? 0,
        actualReturn: inv.actualReturn,
        investedAt: inv.investedAt?.toISOString() ?? "",
        completedAt: inv.completedAt?.toISOString() ?? "",
        status: inv.status,
        cycleStatus: cycle?.status ?? "active",
        farmName: cycle?.farmName ?? "",
        location: cycle?.location ?? "",
        duration: cycle?.duration ?? "",
        roi: cycle?.roi ?? "",
      };
    }, { error: "Not found." as const });
  });

export const getMyTransactionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Transaction } = await import("@/lib/models/transaction.model.server");
    const { Investment } = await import("@/lib/models/investment.model.server");
    const txns = await Transaction.find({ userId: session.data.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const investmentIds = txns
      .map((t) => t.investmentId)
      .filter((id): id is NonNullable<typeof id> => Boolean(id));
    const investments =
      investmentIds.length > 0
        ? await Investment.find({ _id: { $in: investmentIds } })
            .select("cycleTitle")
            .lean()
        : [];
    const titleByInvestmentId = new Map(
      investments.map((inv) => [inv._id.toString(), inv.cycleTitle]),
    );

    return txns.map((txn) => ({
      id: txn._id.toString(),
      type: txn.type,
      amount: txn.amount,
      balanceAfter: txn.balanceAfter,
      status: txn.status,
      reference: txn.reference,
      externalReference: txn.externalReference ?? undefined,
      investmentTitle: txn.investmentId
        ? titleByInvestmentId.get(txn.investmentId.toString())
        : undefined,
      createdAt: txn.createdAt?.toISOString() ?? "",
    }));
  }, []);
});

export const getTransactionDetailFn = createServerFn({ method: "GET" })
  .validator(z.object({ transactionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };

    return withDatabase(async () => {
      const { Transaction } = await import("@/lib/models/transaction.model.server");
      const { User } = await import("@/lib/models/user.model.server");
      const { Investment } = await import("@/lib/models/investment.model.server");

      const txn = await Transaction.findOne({
        _id: data.transactionId,
        userId: session.data.userId,
      }).lean();
      if (!txn) return { error: "Receipt not found." as const };

      const user = await User.findById(session.data.userId).lean();
      let investmentTitle: string | undefined;
      if (txn.investmentId) {
        const inv = await Investment.findById(txn.investmentId).lean();
        investmentTitle = inv?.cycleTitle;
      }

      return {
        id: txn._id.toString(),
        type: txn.type,
        amount: txn.amount,
        balanceAfter: txn.balanceAfter,
        status: txn.status,
        reference: txn.reference,
        externalReference: txn.externalReference ?? undefined,
        createdAt: txn.createdAt?.toISOString() ?? "",
        investorName: user?.fullName ?? "",
        investorEmail: user?.email ?? "",
        investmentTitle,
        metadata: txn.metadata as Record<string, unknown> | undefined,
      };
    }, { error: "Receipt not found." as const });
  });

const withdrawalSchema = z.object({
  amount: z.number().min(1000, "Minimum withdrawal is ₦1,000"),
});

export const requestWithdrawalFn = createServerFn({ method: "POST" })
  .validator(withdrawalSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };
    if (session.data.kycStatus !== "verified") {
      return { error: "Complete KYC verification before withdrawing." as const };
    }

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { requestWithdrawal } = await import("@/lib/wallet.server");
    const { generateReference } = await import("@/lib/format");

    await connectDB();
    const user = await User.findById(session.data.userId);
    if (!user) return { error: "Account not found." as const };
    if (!user.bankName || !user.accountNumber || !user.accountName) {
      return { error: "Add your bank details on your profile before withdrawing." as const };
    }

    try {
      const result = await requestWithdrawal({
        userId: session.data.userId,
        amount: data.amount,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountName: user.accountName,
        reference: generateReference("WDR"),
      });

      return {
        success: true as const,
        reference: result.withdrawal.reference,
        amount: result.withdrawal.amount,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Withdrawal request failed",
      };
    }
  });

export const getMyWithdrawalsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");
    const rows = await Withdrawal.find({ userId: session.data.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return rows.map((row) => ({
      id: row._id.toString(),
      amount: row.amount,
      status: row.status,
      reference: row.reference,
      bankName: row.bankName,
      accountNumber: `****${String(row.accountNumber).slice(-4)}`,
      accountName: row.accountName,
      adminNote: row.adminNote ?? undefined,
      createdAt: row.createdAt?.toISOString() ?? "",
      processedAt: row.processedAt?.toISOString(),
    }));
  }, []);
});
