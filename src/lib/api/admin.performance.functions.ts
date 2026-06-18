import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";
import { getPublicPerformanceFn } from "@/lib/api/performance.functions";

const metricsSchema = z.object({
  totalCycles: z.number().min(0),
  completedCycles: z.number().min(0),
  successRate: z.string().min(1),
  totalPaidOut: z.string().min(1),
  avgRoiDelivered: z.string().min(1),
  totalInvestors: z.number().min(0),
  platformStatsJson: z.string().min(2),
});

const completedCycleSchema = z.object({
  cycleId: z.string().min(1),
  title: z.string().min(1),
  farmName: z.string().min(1),
  type: z.string().min(1),
  roiProjected: z.string().min(1),
  roiDelivered: z.string().min(1),
  status: z.enum(["Completed", "Closed"]),
  completedDate: z.string().min(1),
  investors: z.number().min(0),
  published: z.boolean().optional(),
});

const payoutSchema = z.object({
  cycleId: z.string().min(1),
  cycleTitle: z.string().min(1),
  investors: z.number().min(0),
  capitalReturned: z.string().min(1),
  profitPaid: z.string().min(1),
  payoutDate: z.string().min(1),
  verified: z.boolean().optional(),
  published: z.boolean().optional(),
});

function parseJsonArray<T>(raw: string): T[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected a JSON array");
  return parsed as T[];
}

export const getAdminPerformanceFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };
  return getPublicPerformanceFn();
});

export const updatePlatformMetricsFn = createServerFn({ method: "POST" })
  .validator(metricsSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { PlatformMetrics } = await import("@/lib/models/platform-metrics.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    let platformStats: { value: string; label: string }[];
    try {
      platformStats = parseJsonArray<{ value: string; label: string }>(data.platformStatsJson);
    } catch {
      return { error: "Platform stats must be valid JSON array." as const };
    }

    await connectDB();
    await PlatformMetrics.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          totalCycles: data.totalCycles,
          completedCycles: data.completedCycles,
          successRate: data.successRate,
          totalPaidOut: data.totalPaidOut,
          avgRoiDelivered: data.avgRoiDelivered,
          totalInvestors: data.totalInvestors,
          platformStats,
        },
      },
      { upsert: true, new: true },
    );

    return { success: true as const };
  });

export const upsertCompletedCycleFn = createServerFn({ method: "POST" })
  .validator(completedCycleSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { CompletedCycleRecord } = await import("@/lib/models/completed-cycle.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    await connectDB();

    await CompletedCycleRecord.findOneAndUpdate(
      { cycleId: data.cycleId },
      { $set: { ...data, published: data.published ?? true } },
      { upsert: true, new: true },
    );

    return { success: true as const };
  });

export const deleteCompletedCycleFn = createServerFn({ method: "POST" })
  .validator(z.object({ cycleId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { CompletedCycleRecord } = await import("@/lib/models/completed-cycle.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    await connectDB();

    const deleted = await CompletedCycleRecord.findOneAndDelete({ cycleId: data.cycleId });
    if (!deleted) return { error: "Record not found." as const };
    return { success: true as const };
  });

export const upsertPayoutFn = createServerFn({ method: "POST" })
  .validator(payoutSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { Payout } = await import("@/lib/models/payout.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    await connectDB();

    await Payout.findOneAndUpdate(
      { cycleId: data.cycleId },
      { $set: { ...data, published: data.published ?? true } },
      { upsert: true, new: true },
    );

    return { success: true as const };
  });

export const deletePayoutFn = createServerFn({ method: "POST" })
  .validator(z.object({ cycleId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { Payout } = await import("@/lib/models/payout.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    await connectDB();

    const deleted = await Payout.findOneAndDelete({ cycleId: data.cycleId });
    if (!deleted) return { error: "Payout not found." as const };
    return { success: true as const };
  });
