import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { mapCycleDoc, mapFarmDoc } from "@/lib/content-enrichment";
import type { Farm as FarmType, Opportunity } from "@/lib/mock-data";
import { withDatabase } from "@/lib/with-database";

const PLATFORM_SUCCESS_RATE = "96%";

export const listOpportunitiesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Opportunity[]> =>
    withDatabase(async () => {
      const { Cycle } = await import("@/lib/models/cycle.model.server");
      const docs = await Cycle.find({ published: true }).sort({ createdAt: -1 }).lean();
      return docs.map(mapCycleDoc);
    }, []),
);

export const getOpportunityFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<Opportunity | null> =>
    withDatabase(async () => {
      const { Cycle } = await import("@/lib/models/cycle.model.server");
      const doc = await Cycle.findOne({ slug: data.slug, published: true }).lean();
      return doc ? mapCycleDoc(doc) : null;
    }, null),
  );

export const listFarmsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<FarmType[]> =>
    withDatabase(async () => {
      const { Farm } = await import("@/lib/models/farm.model.server");
      const docs = await Farm.find({ published: true }).sort({ createdAt: -1 }).lean();
      return docs.map(mapFarmDoc);
    }, []),
);

export const getFarmFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<FarmType | null> =>
    withDatabase(async () => {
      const { Farm } = await import("@/lib/models/farm.model.server");
      const doc = await Farm.findOne({ slug: data.slug, published: true }).lean();
      return doc ? mapFarmDoc(doc) : null;
    }, null),
  );

export const getCyclesForFarmFn = createServerFn({ method: "GET" })
  .validator(z.object({ farmSlug: z.string().min(1) }))
  .handler(async ({ data }): Promise<Opportunity[]> =>
    withDatabase(async () => {
      const { Cycle } = await import("@/lib/models/cycle.model.server");
      const docs = await Cycle.find({ farmSlug: data.farmSlug, published: true })
        .sort({ createdAt: -1 })
        .lean();
      return docs.map(mapCycleDoc);
    }, []),
  );

export const getPlatformStatsFn = createServerFn({ method: "GET" }).handler(async () =>
  withDatabase(async () => {
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const { Farm } = await import("@/lib/models/farm.model.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { PlatformMetrics } = await import("@/lib/models/platform-metrics.model.server");

    const [farmCount, cycleCount, investorSum, verifiedInvestors, metrics] = await Promise.all([
      Farm.countDocuments({ published: true }),
      Cycle.countDocuments({ published: true, status: "funding" }),
      Cycle.aggregate([
        { $match: { published: true } },
        { $group: { _id: null, total: { $sum: "$raisedAmount" } } },
      ]),
      User.countDocuments({ role: "investor", kycStatus: "verified" }),
      PlatformMetrics.findOne({ key: "default" }).lean(),
    ]);

    const totalInvested = investorSum[0]?.total ?? 0;
    if (farmCount === 0 && !metrics) return null;

    return {
      totalInvested,
      farmCount,
      openCycles: cycleCount,
      verifiedInvestors,
      successRate: metrics?.successRate ?? PLATFORM_SUCCESS_RATE,
    };
  }, null),
);
