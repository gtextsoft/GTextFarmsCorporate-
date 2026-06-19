import { createServerFn } from "@tanstack/react-start";

import { withDatabase } from "@/lib/with-database";

export type CyclePerformanceSeries = {
  cycleSlug: string;
  cycleTitle: string;
  farmName: string;
  investedAmount: number;
  status: string;
  reportCount: number;
  latestMortality: number | null;
  latestFcr: number | null;
  mortalityTrend: { week: string; rate: number }[];
  fcrTrend: { week: string; fcr: number }[];
  eggTrend: { week: string; crates: number }[];
};

export type InvestorPerformanceData = {
  portfolioAllocation: { name: string; value: number }[];
  cycles: CyclePerformanceSeries[];
  combinedMortality: { week: string; rate: number; cycleTitle: string }[];
};

const emptyPerformance: InvestorPerformanceData = {
  portfolioAllocation: [],
  cycles: [],
  combinedMortality: [],
};

export const getInvestorPerformanceFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Investment } = await import("@/lib/models/investment.model.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    const investments = await Investment.find({
      userId: session.data.userId,
      status: { $in: ["confirmed", "active", "completed"] },
    }).lean();

    if (investments.length === 0) return emptyPerformance;

    const byCycle = new Map<
      string,
      { cycleTitle: string; amount: number; status: string }
    >();

    for (const inv of investments) {
      const existing = byCycle.get(inv.cycleSlug);
      const amount = (existing?.amount ?? 0) + inv.amount;
      byCycle.set(inv.cycleSlug, {
        cycleTitle: inv.cycleTitle,
        amount,
        status: inv.status,
      });
    }

    const cycleSlugs = [...byCycle.keys()];

    const reports = await FieldReport.find({
      cycleSlug: { $in: cycleSlugs },
      status: "published",
    })
      .sort({ weekNumber: 1, publishedAt: 1 })
      .lean();

    const reportsByCycle = new Map<string, typeof reports>();
    for (const report of reports) {
      const list = reportsByCycle.get(report.cycleSlug) ?? [];
      list.push(report);
      reportsByCycle.set(report.cycleSlug, list);
    }

    const portfolioAllocation = [...byCycle.entries()].map(([slug, meta]) => ({
      name: meta.cycleTitle,
      value: meta.amount,
    }));

    const cycles: CyclePerformanceSeries[] = [];
    const combinedMortality: InvestorPerformanceData["combinedMortality"] = [];

    for (const [cycleSlug, meta] of byCycle.entries()) {
      const cycleReports = reportsByCycle.get(cycleSlug) ?? [];
      const farmName = cycleReports[0]?.farmName ?? "—";

      const mortalityTrend: CyclePerformanceSeries["mortalityTrend"] = [];
      const fcrTrend: CyclePerformanceSeries["fcrTrend"] = [];
      const eggTrend: CyclePerformanceSeries["eggTrend"] = [];

      for (const report of cycleReports) {
        const weekLabel = `Wk ${report.weekNumber}`;
        if (typeof report.mortalityRate === "number") {
          mortalityTrend.push({ week: weekLabel, rate: report.mortalityRate });
          combinedMortality.push({
            week: weekLabel,
            rate: report.mortalityRate,
            cycleTitle: meta.cycleTitle,
          });
        }
        if (typeof report.fcr === "number") {
          fcrTrend.push({ week: weekLabel, fcr: report.fcr });
        }
        if (typeof report.eggCount === "number") {
          eggTrend.push({ week: weekLabel, crates: Math.round(report.eggCount / 30) });
        }
      }

      const latestWithMortality = [...cycleReports].reverse().find((r) => r.mortalityRate != null);
      const latestWithFcr = [...cycleReports].reverse().find((r) => r.fcr != null);

      cycles.push({
        cycleSlug,
        cycleTitle: meta.cycleTitle,
        farmName,
        investedAmount: meta.amount,
        status: meta.status,
        reportCount: cycleReports.length,
        latestMortality: latestWithMortality?.mortalityRate ?? null,
        latestFcr: latestWithFcr?.fcr ?? null,
        mortalityTrend,
        fcrTrend,
        eggTrend,
      });
    }

    return {
      portfolioAllocation,
      cycles,
      combinedMortality,
    };
  }, emptyPerformance);
});
