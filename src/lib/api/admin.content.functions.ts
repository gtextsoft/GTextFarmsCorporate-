import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";
import { mapCycleDoc, mapFarmDoc } from "@/lib/content-enrichment";
import type { Farm as FarmType, Opportunity } from "@/lib/mock-data";

export const listAdminFarmsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Farm } = await import("@/lib/models/farm.model.server");

  await connectDB();
  const docs = await Farm.find().sort({ name: 1 }).lean();
  return docs.map(mapFarmDoc);
});

export const listAdminCyclesFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Cycle } = await import("@/lib/models/cycle.model.server");

  await connectDB();
  const docs = await Cycle.find().sort({ createdAt: -1 }).lean();
  return docs.map(mapCycleDoc);
});

export const getAdminFarmFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Farm } = await import("@/lib/models/farm.model.server");

    await connectDB();
    const doc = await Farm.findOne({ slug: data.slug }).lean();
    if (!doc) return { error: "Farm not found." as const };
    return mapFarmDoc(doc);
  });

export const getAdminCycleFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");

    await connectDB();
    const doc = await Cycle.findOne({ slug: data.slug }).lean();
    if (!doc) return { error: "Cycle not found." as const };
    return mapCycleDoc(doc);
  });

const farmVerificationSchema = z.object({
  farmVisited: z.boolean().optional(),
  vetVerified: z.boolean().optional(),
  cacVerified: z.boolean().optional(),
  geoTagged: z.boolean().optional(),
  lastInspection: z.string().optional(),
});

const updateFarmSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  state: z.string().optional(),
  capacity: z.string().optional(),
  description: z.string().optional(),
  birdCount: z.string().optional(),
  mortality: z.string().optional(),
  fcr: z.string().optional(),
  cyclesPerYear: z.number().optional(),
  heroImage: z.string().optional(),
  activeCycleSlug: z.string().optional(),
  ownershipModel: z.string().optional(),
  operatorName: z.string().optional(),
  managerName: z.string().optional(),
  verification: farmVerificationSchema.optional(),
  published: z.boolean().optional(),
});

export const updateFarmFn = createServerFn({ method: "POST" })
  .validator(updateFarmSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Farm } = await import("@/lib/models/farm.model.server");

    await connectDB();
    const { slug, ...updates } = data;
    const farm = await Farm.findOneAndUpdate({ slug }, { $set: updates }, { new: true });
    if (!farm) return { error: "Farm not found." as const };
    return { success: true as const };
  });

const createFarmSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  state: z.string().min(1),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  capacity: z.string().optional(),
  birdCount: z.string().optional(),
  published: z.boolean().optional(),
});

export const createFarmFn = createServerFn({ method: "POST" })
  .validator(createFarmSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Farm } = await import("@/lib/models/farm.model.server");

    await connectDB();
    const existing = await Farm.findOne({ slug: data.slug });
    if (existing) return { error: "A farm with this slug already exists." as const };

    await Farm.create({
      ...data,
      published: data.published ?? false,
    });
    return { success: true as const };
  });

export const deleteFarmFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Farm } = await import("@/lib/models/farm.model.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");

    await connectDB();
    const cycleCount = await Cycle.countDocuments({ farmSlug: data.slug });
    if (cycleCount > 0) {
      return { error: "Delete all cycles for this farm first." as const };
    }

    const result = await Farm.deleteOne({ slug: data.slug });
    if (result.deletedCount === 0) return { error: "Farm not found." as const };
    return { success: true as const };
  });

const updateCycleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  img: z.string().optional(),
  location: z.string().optional(),
  roi: z.string().optional(),
  roiMin: z.number().optional(),
  roiMax: z.number().optional(),
  duration: z.string().optional(),
  durationMonths: z.number().optional(),
  risk: z.enum(["Low", "Moderate", "High"]).optional(),
  ownershipModel: z.string().optional(),
  status: z.enum(["funding", "active", "draft", "closed"]).optional(),
  filled: z.number().min(0).max(100).optional(),
  raisedAmount: z.number().min(0).optional(),
  targetAmount: z.number().min(0).optional(),
  minimumInvestmentAmount: z.number().min(0).optional(),
  published: z.boolean().optional(),
  financials: z.record(z.string()).optional(),
  useOfFunds: z.array(z.object({ label: z.string(), amount: z.string() })).optional(),
  unitEconomics: z
    .object({
      rows: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      revenue: z.string().optional(),
      totalCosts: z.string().optional(),
      expectedProfit: z.string().optional(),
    })
    .optional(),
  investmentTerms: z
    .object({
      lockPeriod: z.string().optional(),
      earlyWithdrawal: z.string().optional(),
      secondaryMarket: z.string().optional(),
      structure: z.string().optional(),
    })
    .optional(),
  worstCaseScenarios: z
    .array(z.object({ scenario: z.string(), impact: z.string(), mitigation: z.string() }))
    .optional(),
  journal: z.array(z.object({ week: z.string(), title: z.string(), note: z.string() })).optional(),
  risks: z.array(z.string()).optional(),
});

export const updateCycleFn = createServerFn({ method: "POST" })
  .validator(updateCycleSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");

    await connectDB();
    const { slug, ...updates } = data;
    const cycle = await Cycle.findOne({ slug });
    if (!cycle) return { error: "Cycle not found." as const };

    Object.assign(cycle, updates);

    if (updates.raisedAmount !== undefined || updates.targetAmount !== undefined) {
      const raised = updates.raisedAmount ?? cycle.raisedAmount ?? 0;
      const target = updates.targetAmount ?? cycle.targetAmount ?? 0;
      if (target > 0) {
        cycle.filled = Math.min(100, Math.round((raised / target) * 100));
        cycle.raised = `₦${(raised / 1_000_000).toFixed(1)}M`;
        cycle.target = `₦${(target / 1_000_000).toFixed(0)}M`;
      }
    }

    if (updates.minimumInvestmentAmount !== undefined) {
      cycle.minimumInvestment = `₦${updates.minimumInvestmentAmount.toLocaleString()}`;
    }

    await cycle.save();
    return { success: true as const };
  });

const createCycleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1),
  cycleType: z.enum(["broiler", "layer", "feed_mill", "processing"]),
  farmSlug: z.string().min(1),
  farmName: z.string().min(1),
  location: z.string().min(1),
  img: z.string().min(1),
  roi: z.string().min(1),
  roiMin: z.number(),
  roiMax: z.number(),
  duration: z.string().min(1),
  durationMonths: z.number(),
  risk: z.enum(["Low", "Moderate", "High"]),
  targetAmount: z.number().min(1),
  minimumInvestmentAmount: z.number().min(1),
  description: z.string().optional(),
  published: z.boolean().optional(),
});

export const createCycleFn = createServerFn({ method: "POST" })
  .validator(createCycleSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");

    await connectDB();
    const existing = await Cycle.findOne({ slug: data.slug });
    if (existing) return { error: "A cycle with this slug already exists." as const };

    const target = data.targetAmount;
    const min = data.minimumInvestmentAmount;

    await Cycle.create({
      ...data,
      status: data.published ? "funding" : "draft",
      filled: 0,
      raisedAmount: 0,
      raised: "₦0.0M",
      target: `₦${(target / 1_000_000).toFixed(0)}M`,
      minimumInvestment: `₦${min.toLocaleString()}`,
      published: data.published ?? false,
    });
    return { success: true as const };
  });

export const deleteCycleFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const { Investment } = await import("@/lib/models/investment.model.server");

    await connectDB();
    const cycle = await Cycle.findOne({ slug: data.slug });
    if (!cycle) return { error: "Cycle not found." as const };

    const investmentCount = await Investment.countDocuments({ cycleId: cycle._id });
    if (investmentCount > 0) {
      return { error: "Cannot delete a cycle with existing investments." as const };
    }

    await Cycle.deleteOne({ slug: data.slug });
    return { success: true as const };
  });
