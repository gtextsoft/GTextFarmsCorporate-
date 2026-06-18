import { createServerFn } from "@tanstack/react-start";

import { requireAdminSession } from "@/lib/api/admin-session";

export const getAdminAnalyticsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Cycle } = await import("@/lib/models/cycle.model.server");
  const { Investment } = await import("@/lib/models/investment.model.server");
  const { FieldReport } = await import("@/lib/models/field-report.model.server");
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");
  const { AuditLog } = await import("@/lib/models/audit-log.model.server");

  await connectDB();

  const [
    investmentAgg,
    activeFundingCycles,
    fundingCycles,
    mortalityReports,
    pendingWithdrawals,
    pendingReports,
    recentAuditLogs,
  ] = await Promise.all([
    Investment.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Cycle.countDocuments({ status: "funding", published: true }),
    Cycle.find({ status: "funding", published: true })
      .select("title slug raisedAmount targetAmount createdAt")
      .lean(),
    FieldReport.find({
      status: "published",
      mortalityRate: { $exists: true, $ne: null },
      publishedAt: { $gte: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000) },
    })
      .sort({ publishedAt: 1 })
      .select("weekNumber mortalityRate cycleTitle publishedAt")
      .lean(),
    Withdrawal.countDocuments({ status: "pending" }),
    FieldReport.countDocuments({ status: "submitted" }),
    AuditLog.find().sort({ createdAt: -1 }).limit(15).lean(),
  ]);

  const totalInvested = investmentAgg[0]?.total ?? 0;
  const investmentCount = investmentAgg[0]?.count ?? 0;

  const now = Date.now();
  const fundingVelocity = fundingCycles.map((cycle) => {
    const daysOpen = Math.max(
      1,
      (now - new Date(cycle.createdAt ?? now).getTime()) / (24 * 60 * 60 * 1000),
    );
    const raised = cycle.raisedAmount ?? 0;
    const perDay = raised / daysOpen;
    const fillPct = cycle.targetAmount
      ? Math.round((raised / cycle.targetAmount) * 100)
      : 0;
    return {
      slug: cycle.slug,
      title: cycle.title,
      raised,
      target: cycle.targetAmount ?? 0,
      fillPct,
      perDay: Math.round(perDay),
      daysOpen: Math.round(daysOpen),
    };
  });

  const avgFundingPerDay =
    fundingVelocity.length > 0
      ? Math.round(
          fundingVelocity.reduce((sum, row) => sum + row.perDay, 0) / fundingVelocity.length,
        )
      : 0;

  const mortalityTrend = mortalityReports.map((report) => ({
    label: `Wk ${report.weekNumber}`,
    cycleTitle: report.cycleTitle,
    mortalityRate: report.mortalityRate ?? 0,
    publishedAt: report.publishedAt?.toISOString() ?? "",
  }));

  const avgMortality =
    mortalityTrend.length > 0
      ? Number(
          (
            mortalityTrend.reduce((sum, row) => sum + row.mortalityRate, 0) /
            mortalityTrend.length
          ).toFixed(2),
        )
      : null;

  return {
    totalInvested,
    investmentCount,
    activeFundingCycles,
    avgFundingPerDay,
    fundingVelocity,
    mortalityTrend,
    avgMortality,
    pendingWithdrawals,
    pendingReports,
    recentAuditLogs: recentAuditLogs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? undefined,
      actorEmail: log.actorEmail ?? undefined,
      details: log.details as Record<string, unknown> | undefined,
      createdAt: log.createdAt?.toISOString() ?? "",
    })),
  };
});
