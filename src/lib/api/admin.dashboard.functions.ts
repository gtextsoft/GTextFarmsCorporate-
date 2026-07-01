import { createServerFn } from "@tanstack/react-start";

import { requireAdminSession } from "@/lib/api/admin-session";

export type AdminDashboardOverview = {
  investors: {
    total: number;
    verified: number;
  };
  platform: {
    totalInvested: number;
    investmentCount: number;
    activeFundingCycles: number;
  };
  queues: {
    newInquiries: number;
    submittedKyc: number;
    pendingWithdrawals: number;
    pendingReports: number;
    pendingWithdrawalAmount: number;
  };
  kycQueue: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
  }>;
  withdrawalQueue: Array<{
    id: string;
    investorName: string;
    amount: number;
    createdAt: string;
  }>;
  reportQueue: Array<{
    id: string;
    title: string;
    farmName: string;
    weekNumber: number;
    authorName: string;
  }>;
  inquiryQueue: Array<{
    id: string;
    name: string;
    subject: string;
    intent: string;
    createdAt: string;
  }>;
  fundingCycles: Array<{
    slug: string;
    title: string;
    raised: number;
    target: number;
    fillPct: number;
  }>;
};

const KYC_PREVIEW_LIMIT = 5;
const PAYOUT_PREVIEW_LIMIT = 5;
const REPORT_PREVIEW_LIMIT = 3;
const INQUIRY_PREVIEW_LIMIT = 7;
const FUNDING_PREVIEW_LIMIT = 5;

export const getAdminDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { Investment } = await import("@/lib/models/investment.model.server");
  const { Cycle } = await import("@/lib/models/cycle.model.server");
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");
  const { FieldReport } = await import("@/lib/models/field-report.model.server");
  const { ContactInquiry } = await import("@/lib/models/contact-inquiry.model.server");
  const { mapFieldReport } = await import("@/lib/field-report-mapper");

  await connectDB();

  const [
    verifiedInvestors,
    totalInvestors,
    investmentAgg,
    activeFundingCycles,
    newInquiries,
    submittedKyc,
    pendingWithdrawals,
    pendingReports,
    pendingWithdrawalAgg,
    kycDocs,
    withdrawalDocs,
    reportDocs,
    inquiryDocs,
    fundingCycleDocs,
  ] = await Promise.all([
    User.countDocuments({ role: "investor", kycStatus: "verified" }),
    User.countDocuments({ role: "investor" }),
    Investment.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Cycle.countDocuments({ status: "funding", published: true }),
    ContactInquiry.countDocuments({ status: "new" }),
    User.countDocuments({ role: "investor", kycStatus: "submitted" }),
    Withdrawal.countDocuments({ status: "pending" }),
    FieldReport.countDocuments({ status: "submitted" }),
    Withdrawal.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    User.find({ role: "investor", kycStatus: "submitted" })
      .sort({ updatedAt: -1 })
      .limit(KYC_PREVIEW_LIMIT)
      .lean(),
    Withdrawal.find({ status: "pending" }).sort({ createdAt: -1 }).limit(PAYOUT_PREVIEW_LIMIT).lean(),
    FieldReport.find({ status: "submitted" }).sort({ createdAt: -1 }).limit(REPORT_PREVIEW_LIMIT).lean(),
    ContactInquiry.find({ status: "new" }).sort({ createdAt: -1 }).limit(INQUIRY_PREVIEW_LIMIT).lean(),
    Cycle.find({ status: "funding", published: true })
      .select("title slug raisedAmount targetAmount")
      .sort({ createdAt: -1 })
      .limit(FUNDING_PREVIEW_LIMIT)
      .lean(),
  ]);

  const withdrawalUserIds = [...new Set(withdrawalDocs.map((w) => w.userId.toString()))];
  const withdrawalUsers = await User.find({ _id: { $in: withdrawalUserIds } })
    .select("fullName email")
    .lean();
  const withdrawalUserMap = new Map(withdrawalUsers.map((u) => [u._id.toString(), u]));

  const totalInvested = investmentAgg[0]?.total ?? 0;
  const investmentCount = investmentAgg[0]?.count ?? 0;
  const pendingWithdrawalAmount = pendingWithdrawalAgg[0]?.total ?? 0;

  return {
    investors: {
      total: totalInvestors,
      verified: verifiedInvestors,
    },
    platform: {
      totalInvested,
      investmentCount,
      activeFundingCycles,
    },
    queues: {
      newInquiries,
      submittedKyc,
      pendingWithdrawals,
      pendingReports,
      pendingWithdrawalAmount,
    },
    kycQueue: kycDocs.map((u) => ({
      id: u._id.toString(),
      fullName: u.fullName,
      email: u.email,
      createdAt: u.createdAt?.toISOString() ?? "",
    })),
    withdrawalQueue: withdrawalDocs.map((row) => {
      const user = withdrawalUserMap.get(row.userId.toString());
      return {
        id: row._id.toString(),
        investorName: user?.fullName ?? "—",
        amount: row.amount,
        createdAt: row.createdAt?.toISOString() ?? "",
      };
    }),
    reportQueue: reportDocs.map((doc) => {
      const mapped = mapFieldReport(doc as Record<string, unknown>);
      return {
        id: mapped.id,
        title: mapped.title,
        farmName: mapped.farmName,
        weekNumber: mapped.weekNumber,
        authorName: mapped.authorName,
      };
    }),
    inquiryQueue: inquiryDocs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      subject: doc.subject,
      intent: doc.intent ?? "general",
      createdAt: doc.createdAt?.toISOString() ?? "",
    })),
    fundingCycles: fundingCycleDocs.map((cycle) => {
      const raised = cycle.raisedAmount ?? 0;
      const target = cycle.targetAmount ?? 0;
      return {
        slug: cycle.slug,
        title: cycle.title,
        raised,
        target,
        fillPct: target > 0 ? Math.round((raised / target) * 100) : 0,
      };
    }),
  } satisfies AdminDashboardOverview;
});
