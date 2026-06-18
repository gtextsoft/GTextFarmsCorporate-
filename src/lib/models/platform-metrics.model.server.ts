import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const platformStatSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
);

const platformMetricsSchema = new Schema(
  {
    key: { type: String, default: "default", unique: true },
    totalCycles: { type: Number, default: 0 },
    completedCycles: { type: Number, default: 0 },
    successRate: { type: String, default: "—" },
    totalPaidOut: { type: String, default: "—" },
    avgRoiDelivered: { type: String, default: "—" },
    totalInvestors: { type: Number, default: 0 },
    platformStats: [platformStatSchema],
  },
  { timestamps: true },
);

export type PlatformMetricsDocument = InferSchemaType<typeof platformMetricsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PlatformMetrics: Model<PlatformMetricsDocument> =
  (mongoose.models.PlatformMetrics as Model<PlatformMetricsDocument> | undefined) ??
  mongoose.model<PlatformMetricsDocument>("PlatformMetrics", platformMetricsSchema);
