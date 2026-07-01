import { createServerFn } from "@tanstack/react-start";

import { withDatabase } from "@/lib/with-database";

export type CyclePerformanceSeries = {
  cycleSlug: string;
  cycleTitle: string;
  farmName: string;
  location: string;
  investedAmount: number;
  status: string;
  reportCount: number;
  latestMortality: number | null;
  latestFcr: number | null;
  latestEggCrates: number | null;
  latestBirdCount: number | null;
  latestFeedKg: number | null;
  latestReportDate: string | null;
  mortalityTrend: { week: string; rate: number }[];
  fcrTrend: { week: string; fcr: number }[];
  eggTrend: { week: string; crates: number }[];
  feedTrend: { week: string; kg: number }[];
};

export type InvestorPerformanceSummary = {
  totalInvested: number;
  activeCycles: number;
  totalReports: number;
  avgMortality: number | null;
  latestEggCrates: number | null;
  latestReportDate: string | null;
};

export type InvestorPerformanceData = {
  summary: InvestorPerformanceSummary;
  portfolioAllocation: { name: string; value: number; slug: string }[];
  cycles: CyclePerformanceSeries[];
  combinedMortality: { week: string; rate: number; cycleTitle: string; cycleSlug: string }[];
};

const emptySummary: InvestorPerformanceSummary = {
  totalInvested: 0,
  activeCycles: 0,
  totalReports: 0,
  avgMortality: null,
  latestEggCrates: null,
  latestReportDate: null,
};

const emptyPerformance: InvestorPerformanceData = {
  summary: emptySummary,
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
    const { Cycle } = await import("@/lib/models/cycle.model.server");

    const investments = await Investment.find({
      userId: session.data.userId,
      status: { $in: ["confirmed", "active", "completed"] },
    }).lean();

    if (investments.length === 0) return emptyPerformance;

    const byCycle = new Map<
      string,
      { cycleTitle: string; amount: number; status: string; cycleId: string }
    >();

    for (const inv of investments) {
      const existing = byCycle.get(inv.cycleSlug);
      const amount = (existing?.amount ?? 0) + inv.amount;
      byCycle.set(inv.cycleSlug, {
        cycleTitle: inv.cycleTitle,
        amount,
        status: inv.status,
        cycleId: inv.cycleId.toString(),
      });
    }

    const cycleIds = [...new Set([...byCycle.values()].map((c) => c.cycleId))];
    const cycleDocs = await Cycle.find({ _id: { $in: cycleIds } }).lean();
    const cycleMetaBySlug = new Map(
      cycleDocs.map((c) => [c.slug, { location: c.location ?? "", farmName: c.farmName ?? "" }]),
    );

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
      slug,
    }));

    const cycles: CyclePerformanceSeries[] = [];
    const combinedMortality: InvestorPerformanceData["combinedMortality"] = [];
    const mortalityValues: number[] = [];
    let latestEggCrates: number | null = null;
    let latestReportDate: string | null = null;

    for (const [cycleSlug, meta] of byCycle.entries()) {
      const cycleReports = reportsByCycle.get(cycleSlug) ?? [];
      const cycleInfo = cycleMetaBySlug.get(cycleSlug);
      const farmName = cycleReports[0]?.farmName ?? cycleInfo?.farmName ?? "—";
      const location = cycleInfo?.location ?? "";

      const mortalityTrend: CyclePerformanceSeries["mortalityTrend"] = [];
      const fcrTrend: CyclePerformanceSeries["fcrTrend"] = [];
      const eggTrend: CyclePerformanceSeries["eggTrend"] = [];
      const feedTrend: CyclePerformanceSeries["feedTrend"] = [];

      for (const report of cycleReports) {
        const weekLabel = `Wk ${report.weekNumber}`;
        if (typeof report.mortalityRate === "number") {
          mortalityTrend.push({ week: weekLabel, rate: report.mortalityRate });
          combinedMortality.push({
            week: weekLabel,
            rate: report.mortalityRate,
            cycleTitle: meta.cycleTitle,
            cycleSlug,
          });
          mortalityValues.push(report.mortalityRate);
        }
        if (typeof report.fcr === "number") {
          fcrTrend.push({ week: weekLabel, fcr: report.fcr });
        }
        if (typeof report.eggCount === "number") {
          eggTrend.push({ week: weekLabel, crates: Math.round(report.eggCount / 30) });
        }
        if (typeof report.feedConsumptionKg === "number") {
          feedTrend.push({ week: weekLabel, kg: report.feedConsumptionKg });
        }
      }

      const latestReport = [...cycleReports].reverse()[0];
      const latestWithMortality = [...cycleReports].reverse().find((r) => r.mortalityRate != null);
      const latestWithFcr = [...cycleReports].reverse().find((r) => r.fcr != null);
      const latestWithEggs = [...cycleReports].reverse().find((r) => r.eggCount != null);
      const latestWithFeed = [...cycleReports].reverse().find((r) => r.feedConsumptionKg != null);

      if (latestReport?.publishedAt) {
        const publishedIso = latestReport.publishedAt.toISOString();
        if (!latestReportDate || publishedIso > latestReportDate) {
          latestReportDate = publishedIso;
        }
      }

      const eggCrates =
        latestWithEggs?.eggCount != null ? Math.round(latestWithEggs.eggCount / 30) : null;
      if (eggCrates != null) {
        latestEggCrates = (latestEggCrates ?? 0) + eggCrates;
      }

      cycles.push({
        cycleSlug,
        cycleTitle: meta.cycleTitle,
        farmName,
        location,
        investedAmount: meta.amount,
        status: meta.status,
        reportCount: cycleReports.length,
        latestMortality: latestWithMortality?.mortalityRate ?? null,
        latestFcr: latestWithFcr?.fcr ?? null,
        latestEggCrates: eggCrates,
        latestBirdCount: latestReport?.birdCount ?? null,
        latestFeedKg: latestWithFeed?.feedConsumptionKg ?? null,
        latestReportDate: latestReport?.publishedAt?.toISOString() ?? null,
        mortalityTrend,
        fcrTrend,
        eggTrend,
        feedTrend,
      });
    }

    const totalInvested = portfolioAllocation.reduce((sum, item) => sum + item.value, 0);
    const activeCycles = cycles.filter((c) => ["confirmed", "active"].includes(c.status)).length;
    const avgMortality =
      mortalityValues.length > 0
        ? Math.round((mortalityValues.reduce((a, b) => a + b, 0) / mortalityValues.length) * 10) / 10
        : null;

    return {
      summary: {
        totalInvested,
        activeCycles,
        totalReports: reports.length,
        avgMortality,
        latestEggCrates,
        latestReportDate,
      },
      portfolioAllocation,
      cycles,
      combinedMortality,
    };
  }, emptyPerformance);
});
