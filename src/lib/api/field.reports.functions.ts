import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireFieldOfficerSession } from "@/lib/api/field-session";
import { mapFieldReport, type FieldReportView } from "@/lib/field-report-mapper";

const reportBodySchema = z.object({
  cycleSlug: z.string().min(1),
  weekNumber: z.number().min(1),
  title: z.string().min(1),
  body: z.string().min(10),
  mortalityRate: z.number().min(0).max(100).optional(),
  birdCount: z.number().min(0).optional(),
  feedConsumptionKg: z.number().min(0).optional(),
  fcr: z.number().min(0).optional(),
  eggCount: z.number().min(0).optional(),
  vaccinationStatus: z.string().optional(),
  imageUrls: z.array(z.string().min(1)).max(5).optional(),
});

export const listFieldCyclesFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireFieldOfficerSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Cycle } = await import("@/lib/models/cycle.model.server");
  const { Farm } = await import("@/lib/models/farm.model.server");

  await connectDB();
  const cycles = await Cycle.find({ status: { $in: ["funding", "active"] } })
    .sort({ farmName: 1, title: 1 })
    .lean();
  const farmSlugs = [...new Set(cycles.map((c) => c.farmSlug))];
  const farms = await Farm.find({ slug: { $in: farmSlugs } }).lean();
  const farmMap = new Map(farms.map((f) => [f.slug, f.name]));

  return cycles.map((c) => ({
    slug: c.slug,
    title: c.title,
    farmSlug: c.farmSlug,
    farmName: farmMap.get(c.farmSlug) ?? c.farmName,
  }));
});

export const listMyFieldReportsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireFieldOfficerSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { FieldReport } = await import("@/lib/models/field-report.model.server");

  await connectDB();
  const filter =
    auth.user.role === "field_officer"
      ? { authorId: auth.user._id }
      : {};

  const docs = await FieldReport.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  return docs.map((doc) => mapFieldReport(doc as Record<string, unknown>));
});

export const getFieldReportFn = createServerFn({ method: "GET" })
  .validator(z.object({ reportId: z.string().min(1) }))
  .handler(async ({ data }): Promise<FieldReportView | { error: string }> => {
    const auth = await requireFieldOfficerSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const doc = await FieldReport.findById(data.reportId).lean();
    if (!doc) return { error: "Report not found." };
    if (
      auth.user.role === "field_officer" &&
      doc.authorId.toString() !== auth.user._id.toString()
    ) {
      return { error: "Forbidden." };
    }
    if (doc.status === "published") {
      return { error: "Published reports cannot be edited." };
    }

    return mapFieldReport(doc as Record<string, unknown>);
  });

export const createFieldReportFn = createServerFn({ method: "POST" })
  .validator(reportBodySchema)
  .handler(async ({ data }) => {
    const auth = await requireFieldOfficerSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const { Farm } = await import("@/lib/models/farm.model.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const cycle = await Cycle.findOne({ slug: data.cycleSlug }).lean();
    if (!cycle) return { error: "Cycle not found." as const };

    const farm = await Farm.findOne({ slug: cycle.farmSlug }).lean();
    if (!farm) return { error: "Farm not found." as const };

    const doc = await FieldReport.create({
      cycleId: cycle._id,
      cycleSlug: cycle.slug,
      cycleTitle: cycle.title,
      farmId: farm._id,
      farmSlug: farm.slug,
      farmName: farm.name,
      authorId: auth.user._id,
      authorName: auth.user.fullName,
      weekNumber: data.weekNumber,
      title: data.title,
      body: data.body,
      mortalityRate: data.mortalityRate,
      birdCount: data.birdCount,
      feedConsumptionKg: data.feedConsumptionKg,
      fcr: data.fcr,
      eggCount: data.eggCount,
      vaccinationStatus: data.vaccinationStatus,
      imageUrls: data.imageUrls ?? [],
      status: "draft",
    });

    return { success: true as const, reportId: doc._id.toString() };
  });

export const updateFieldReportFn = createServerFn({ method: "POST" })
  .validator(
    reportBodySchema.extend({
      reportId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireFieldOfficerSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Cycle } = await import("@/lib/models/cycle.model.server");
    const { Farm } = await import("@/lib/models/farm.model.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const report = await FieldReport.findById(data.reportId);
    if (!report) return { error: "Report not found." as const };
    if (
      auth.user.role === "field_officer" &&
      report.authorId.toString() !== auth.user._id.toString()
    ) {
      return { error: "Forbidden." as const };
    }
    if (report.status !== "draft" && report.status !== "rejected") {
      return { error: "Only draft or rejected reports can be edited." as const };
    }

    const cycle = await Cycle.findOne({ slug: data.cycleSlug }).lean();
    if (!cycle) return { error: "Cycle not found." as const };
    const farm = await Farm.findOne({ slug: cycle.farmSlug }).lean();
    if (!farm) return { error: "Farm not found." as const };

    report.cycleId = cycle._id;
    report.cycleSlug = cycle.slug;
    report.cycleTitle = cycle.title;
    report.farmId = farm._id;
    report.farmSlug = farm.slug;
    report.farmName = farm.name;
    report.weekNumber = data.weekNumber;
    report.title = data.title;
    report.body = data.body;
    report.mortalityRate = data.mortalityRate;
    report.birdCount = data.birdCount;
    report.feedConsumptionKg = data.feedConsumptionKg;
    report.fcr = data.fcr;
    report.eggCount = data.eggCount;
    report.vaccinationStatus = data.vaccinationStatus;
    report.imageUrls = data.imageUrls ?? [];
    if (report.status === "rejected") {
      report.status = "draft";
      report.rejectionReason = undefined;
    }
    await report.save();

    return { success: true as const };
  });

export const submitFieldReportFn = createServerFn({ method: "POST" })
  .validator(z.object({ reportId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireFieldOfficerSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const report = await FieldReport.findById(data.reportId);
    if (!report) return { error: "Report not found." as const };
    if (
      auth.user.role === "field_officer" &&
      report.authorId.toString() !== auth.user._id.toString()
    ) {
      return { error: "Forbidden." as const };
    }
    if (report.status !== "draft" && report.status !== "rejected") {
      return { error: "Report cannot be submitted in its current state." as const };
    }

    report.status = "submitted";
    report.rejectionReason = undefined;
    await report.save();

    return { success: true as const };
  });

export const getFieldOfficerStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireFieldOfficerSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { FieldReport } = await import("@/lib/models/field-report.model.server");

  await connectDB();

  const filter =
    auth.user.role === "field_officer" ? { authorId: auth.user._id } : {};

  const [draft, submitted, published, rejected] = await Promise.all([
    FieldReport.countDocuments({ ...filter, status: "draft" }),
    FieldReport.countDocuments({ ...filter, status: "submitted" }),
    FieldReport.countDocuments({ ...filter, status: "published" }),
    FieldReport.countDocuments({ ...filter, status: "rejected" }),
  ]);

  return { draft, submitted, published, rejected };
});

export const viewMyFieldReportFn = createServerFn({ method: "GET" })
  .validator(z.object({ reportId: z.string().min(1) }))
  .handler(async ({ data }): Promise<FieldReportView | { error: string }> => {
    const auth = await requireFieldOfficerSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const doc = await FieldReport.findById(data.reportId).lean();
    if (!doc) return { error: "Report not found." };
    if (
      auth.user.role === "field_officer" &&
      doc.authorId.toString() !== auth.user._id.toString()
    ) {
      return { error: "Forbidden." };
    }

    return mapFieldReport(doc as Record<string, unknown>);
  });
