/**
 * Demo field reports and sample investor data for charts / transparency UX.
 */
import type { Model } from "mongoose";

import type { CycleDocument } from "../src/lib/models/cycle.model.server";
import type { FarmDocument } from "../src/lib/models/farm.model.server";
import type { UserDocument } from "../src/lib/models/user.model.server";

type FieldReportModel = Model<unknown>;
type InvestmentModel = Model<unknown>;

const broilerReports = [
  {
    weekNumber: 1,
    title: "Day-old chicks arrived",
    body: "12,000 birds received from verified hatchery. Housing and brooding conditions verified.",
    mortalityRate: 0.2,
    birdCount: 12000,
    fcr: 1.1,
    feedConsumptionKg: 840,
  },
  {
    weekNumber: 2,
    title: "Vaccination phase 1",
    body: "Newcastle + Gumboro administered. 100% coverage across all houses.",
    mortalityRate: 0.4,
    birdCount: 11952,
    fcr: 1.28,
    feedConsumptionKg: 2100,
  },
  {
    weekNumber: 3,
    title: "Feed conversion check",
    body: "FCR tracking ahead of benchmark. Uniform weight gain across pens.",
    mortalityRate: 0.7,
    birdCount: 11868,
    fcr: 1.42,
    feedConsumptionKg: 4200,
  },
  {
    weekNumber: 4,
    title: "Mid-cycle weigh-in",
    body: "Average weight 1.65kg. Mortality within industry benchmark.",
    mortalityRate: 0.9,
    birdCount: 11772,
    fcr: 1.48,
    feedConsumptionKg: 6800,
  },
] as const;

const layerReports = [
  {
    weekNumber: 1,
    title: "Pullets transferred to layers",
    body: "8,000 point-of-lay birds housed. Water and feed systems calibrated.",
    mortalityRate: 0.3,
    birdCount: 8000,
    fcr: 1.9,
    eggCount: 4200,
  },
  {
    weekNumber: 2,
    title: "Production ramp-up",
    body: "Laying rate climbing toward peak. Daily egg collection on schedule.",
    mortalityRate: 0.5,
    birdCount: 7960,
    fcr: 1.85,
    eggCount: 16800,
  },
  {
    weekNumber: 3,
    title: "Wholesale dispatch",
    body: "First bulk crate dispatch to Lagos wholesale buyers.",
    mortalityRate: 0.6,
    birdCount: 7912,
    fcr: 1.82,
    eggCount: 22400,
  },
  {
    weekNumber: 4,
    title: "Peak laying phase",
    body: "85% laying rate achieved. Mortality stable.",
    mortalityRate: 0.6,
    birdCount: 7864,
    fcr: 1.8,
    eggCount: 26880,
  },
] as const;

export async function seedDemoFieldReports(params: {
  FieldReport: FieldReportModel;
  Cycle: Model<CycleDocument>;
  Farm: Model<FarmDocument>;
  User: Model<UserDocument>;
  Investment?: InvestmentModel;
}) {
  const { FieldReport, Cycle, Farm, User, Investment } = params;

  const fieldOfficer =
    (await User.findOne({ role: "field_officer" })) ??
    (await User.findOne({ role: "admin" })) ??
    (await User.findOne());

  if (!fieldOfficer) {
    console.log("Skipping field report seed — no users found. Run db:create-admin first.");
    return;
  }

  const authorName = fieldOfficer.fullName ?? "Field Officer";
  const authorId = fieldOfficer._id;

  const cycleConfigs = [
    { slug: "ibadan-broiler-cycle-14", reports: broilerReports },
    { slug: "layer-expansion-abeokuta", reports: layerReports },
  ] as const;

  for (const config of cycleConfigs) {
    const cycle = await Cycle.findOne({ slug: config.slug });
    if (!cycle) continue;

    const farm = await Farm.findOne({ slug: cycle.farmSlug });
    if (!farm) continue;

    for (const [index, report] of config.reports.entries()) {
      const publishedAt = new Date(Date.now() - (config.reports.length - index) * 7 * 24 * 60 * 60 * 1000);

      await FieldReport.findOneAndUpdate(
        { cycleSlug: cycle.slug, weekNumber: report.weekNumber },
        {
          $set: {
            cycleId: cycle._id,
            cycleSlug: cycle.slug,
            cycleTitle: cycle.title,
            farmId: farm._id,
            farmSlug: farm.slug,
            farmName: cycle.farmName,
            authorId,
            authorName,
            weekNumber: report.weekNumber,
            title: report.title,
            body: report.body,
            mortalityRate: report.mortalityRate,
            birdCount: report.birdCount,
            fcr: report.fcr,
            feedConsumptionKg: "feedConsumptionKg" in report ? report.feedConsumptionKg : undefined,
            eggCount: "eggCount" in report ? report.eggCount : undefined,
            vaccinationStatus: "On schedule",
            status: "published",
            publishedAt,
          },
        },
        { upsert: true, new: true },
      );
    }
  }

  if (Investment) {
    const investor = await User.findOne({ email: "investor@gtextfarms.ng" });
    const broilerCycle = await Cycle.findOne({ slug: "ibadan-broiler-cycle-14" });

    if (investor && broilerCycle) {
      await Investment.findOneAndUpdate(
        { userId: investor._id, cycleSlug: broilerCycle.slug },
        {
          $set: {
            cycleId: broilerCycle._id,
            cycleSlug: broilerCycle.slug,
            cycleTitle: broilerCycle.title,
            amount: 250_000,
            status: "confirmed",
            certificateNumber: "GTEXT-DEMO-001",
            expectedReturnMin: broilerCycle.roiMin ?? 12,
            expectedReturnMax: broilerCycle.roiMax ?? 18,
            investedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true, new: true },
      );
    }
  }

  const reportCount = await FieldReport.countDocuments({ status: "published" });
  console.log(`Seeded demo field reports (${reportCount} published total).`);
}
