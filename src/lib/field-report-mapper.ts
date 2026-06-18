import type { FieldReportDocument } from "@/lib/models/field-report.model.server";

export interface FieldReportView {
  id: string;
  cycleSlug: string;
  cycleTitle: string;
  farmSlug: string;
  farmName: string;
  authorName: string;
  weekNumber: number;
  title: string;
  body: string;
  mortalityRate?: number;
  birdCount?: number;
  feedConsumptionKg?: number;
  fcr?: number;
  eggCount?: number;
  vaccinationStatus?: string;
  imageUrls: string[];
  status: string;
  publishedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapFieldReport(doc: FieldReportDocument | Record<string, unknown>): FieldReportView {
  const d = doc as FieldReportDocument;
  return {
    id: d._id.toString(),
    cycleSlug: String(d.cycleSlug ?? ""),
    cycleTitle: String(d.cycleTitle ?? ""),
    farmSlug: String(d.farmSlug ?? ""),
    farmName: String(d.farmName ?? ""),
    authorName: String(d.authorName ?? ""),
    weekNumber: typeof d.weekNumber === "number" ? d.weekNumber : 0,
    title: String(d.title ?? ""),
    body: String(d.body ?? ""),
    mortalityRate: typeof d.mortalityRate === "number" ? d.mortalityRate : undefined,
    birdCount: typeof d.birdCount === "number" ? d.birdCount : undefined,
    feedConsumptionKg: typeof d.feedConsumptionKg === "number" ? d.feedConsumptionKg : undefined,
    fcr: typeof d.fcr === "number" ? d.fcr : undefined,
    eggCount: typeof d.eggCount === "number" ? d.eggCount : undefined,
    vaccinationStatus: d.vaccinationStatus ? String(d.vaccinationStatus) : undefined,
    imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls.map(String) : [],
    status: String(d.status ?? "draft"),
    publishedAt: d.publishedAt?.toISOString?.() ?? (d.publishedAt ? String(d.publishedAt) : undefined),
    rejectionReason: d.rejectionReason ? String(d.rejectionReason) : undefined,
    createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: d.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
