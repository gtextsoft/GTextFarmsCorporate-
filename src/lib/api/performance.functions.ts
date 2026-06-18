import { createServerFn } from "@tanstack/react-start";

import type {
  CompletedCycle,
  PayoutRecord,
  PerformanceSummary,
} from "@/lib/mock-data";

export interface PublicPerformanceData {
  summary: PerformanceSummary;
  platformStats: { value: string; label: string }[];
  completedCycles: CompletedCycle[];
  payoutHistory: PayoutRecord[];
  lastPayout: PayoutRecord | null;
}

function mapCompleted(doc: Record<string, unknown>): CompletedCycle {
  return {
    id: String(doc.cycleId),
    title: String(doc.title ?? ""),
    farmName: String(doc.farmName ?? ""),
    type: String(doc.type ?? ""),
    roiProjected: String(doc.roiProjected ?? ""),
    roiDelivered: String(doc.roiDelivered ?? ""),
    status: (doc.status === "Closed" ? "Closed" : "Completed") as CompletedCycle["status"],
    completedDate: String(doc.completedDate ?? ""),
    investors: typeof doc.investors === "number" ? doc.investors : 0,
  };
}

function mapPayout(doc: Record<string, unknown>): PayoutRecord {
  return {
    cycleId: String(doc.cycleId ?? ""),
    cycleTitle: String(doc.cycleTitle ?? ""),
    investors: typeof doc.investors === "number" ? doc.investors : 0,
    capitalReturned: String(doc.capitalReturned ?? ""),
    profitPaid: String(doc.profitPaid ?? ""),
    payoutDate: String(doc.payoutDate ?? ""),
    verified: doc.verified !== false,
  };
}

function mapSummary(doc: Record<string, unknown>): PerformanceSummary {
  return {
    totalCycles: typeof doc.totalCycles === "number" ? doc.totalCycles : 0,
    completedCycles: typeof doc.completedCycles === "number" ? doc.completedCycles : 0,
    successRate: String(doc.successRate ?? "—"),
    totalPaidOut: String(doc.totalPaidOut ?? "—"),
    avgRoiDelivered: String(doc.avgRoiDelivered ?? "—"),
    totalInvestors: typeof doc.totalInvestors === "number" ? doc.totalInvestors : 0,
  };
}

const EMPTY_PERFORMANCE: PublicPerformanceData = {
  summary: {
    totalCycles: 0,
    completedCycles: 0,
    successRate: "—",
    totalPaidOut: "—",
    avgRoiDelivered: "—",
    totalInvestors: 0,
  },
  platformStats: [],
  completedCycles: [],
  payoutHistory: [],
  lastPayout: null,
};

export const getPublicPerformanceFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicPerformanceData> => {
    const { withDatabase } = await import("@/lib/with-database");

    return withDatabase(async () => {
    const { CompletedCycleRecord } = await import("@/lib/models/completed-cycle.model.server");
    const { Payout } = await import("@/lib/models/payout.model.server");
    const { PlatformMetrics } = await import("@/lib/models/platform-metrics.model.server");

    const [metrics, completedDocs, payoutDocs] = await Promise.all([
      PlatformMetrics.findOne({ key: "default" }).lean(),
      CompletedCycleRecord.find({ published: true })
        .sort({ sortOrder: -1, createdAt: -1 })
        .lean(),
      Payout.find({ published: true }).sort({ sortOrder: -1, createdAt: -1 }).lean(),
    ]);

    if (!metrics && completedDocs.length === 0 && payoutDocs.length === 0) {
      return EMPTY_PERFORMANCE;
    }

    const payoutHistory = payoutDocs.map((doc) => mapPayout(doc as Record<string, unknown>));

    return {
      summary: metrics
        ? mapSummary(metrics as Record<string, unknown>)
        : EMPTY_PERFORMANCE.summary,
      platformStats: Array.isArray(metrics?.platformStats)
        ? metrics.platformStats.map((s) => ({
            value: String(s.value ?? ""),
            label: String(s.label ?? ""),
          }))
        : [],
      completedCycles: completedDocs.map((doc) =>
        mapCompleted(doc as Record<string, unknown>),
      ),
      payoutHistory,
      lastPayout: payoutHistory[0] ?? null,
    };
    }, EMPTY_PERFORMANCE);
  },
);
