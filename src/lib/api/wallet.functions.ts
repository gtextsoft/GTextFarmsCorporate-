import { createServerFn } from "@tanstack/react-start";
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

  const { getWalletSummary } = await import("@/lib/wallet.server");
  try {
    const summary = await getWalletSummary(session.data.userId);
    return {
      balance: summary.balance,
      totalInvested: summary.totalInvested,
      activeInvestments: summary.activeInvestments,
      totalReturns: 0,
    };
  } catch {
    return {
      balance: 0,
      totalInvested: 0,
      activeInvestments: 0,
      totalReturns: 0,
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

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const { Investment } = await import("@/lib/models/investment.model.server");
    const { debitWalletForInvestment, newTxnReference } = await import("@/lib/wallet.server");

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

    try {
      const investment = await Investment.create({
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
      });

      await debitWalletForInvestment({
        userId: auth.userId,
        amount: data.amount,
        investmentId: investment._id,
        reference: txnRef,
      });

      cycle.raisedAmount = (cycle.raisedAmount ?? 0) + data.amount;
      cycle.filled = cycle.targetAmount
        ? Math.min(100, Math.round((cycle.raisedAmount / cycle.targetAmount) * 100))
        : cycle.filled;
      cycle.raised = `₦${(cycle.raisedAmount / 1_000_000).toFixed(1)}M`;
      await cycle.save();

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
        const { createNotification, notifySafe: notify } = await import(
          "@/lib/notifications.server"
        );
        await notify(
          () =>
            createNotification({
              userId: auth.userId,
              type: "investment",
              title: "Investment confirmed",
              body: `Your ${formatNaira(data.amount)} investment in ${cycle.title} is confirmed.`,
              link: `/app/investments/${investment._id.toString()}/certificate`,
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
        entityId: investment._id.toString(),
        details: {
          cycleSlug: cycle.slug,
          amount: data.amount,
          certificateNumber,
        },
      });

      return {
        success: true as const,
        investment: {
          id: investment._id.toString(),
          certificateNumber,
          amount: data.amount,
          cycleTitle: cycle.title,
          expectedReturnMin,
          expectedReturnMax,
        },
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Investment failed",
      };
    }
  });

export const getMyInvestmentsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Investment } = await import("@/lib/models/investment.model.server");
    const investments = await Investment.find({ userId: session.data.userId })
      .sort({ investedAt: -1 })
      .lean();

    return investments.map((inv) => ({
      id: inv._id.toString(),
      cycleSlug: inv.cycleSlug,
      cycleTitle: inv.cycleTitle,
      amount: inv.amount,
      status: inv.status,
      certificateNumber: inv.certificateNumber,
      expectedReturnMin: inv.expectedReturnMin,
      expectedReturnMax: inv.expectedReturnMax,
      investedAt: inv.investedAt?.toISOString() ?? "",
    }));
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

      const inv = await Investment.findOne({
        _id: data.investmentId,
        userId: session.data.userId,
      }).lean();
      if (!inv) return { error: "Not found." as const };

      const user = await User.findById(session.data.userId).lean();

      return {
        certificateNumber: inv.certificateNumber ?? "",
        investorName: user?.fullName ?? "",
        investorEmail: user?.email ?? "",
        cycleTitle: inv.cycleTitle,
        amount: inv.amount,
        expectedReturnMin: inv.expectedReturnMin ?? 0,
        expectedReturnMax: inv.expectedReturnMax ?? 0,
        investedAt: inv.investedAt?.toISOString() ?? "",
        status: inv.status,
      };
    }, { error: "Not found." as const });
  });

export const getMyTransactionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Transaction } = await import("@/lib/models/transaction.model.server");
    const txns = await Transaction.find({ userId: session.data.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return txns.map((txn) => ({
      id: txn._id.toString(),
      type: txn.type,
      amount: txn.amount,
      balanceAfter: txn.balanceAfter,
      status: txn.status,
      reference: txn.reference,
      externalReference: txn.externalReference ?? undefined,
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
