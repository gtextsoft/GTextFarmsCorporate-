import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const fieldReportSchema = new Schema(
  {
    cycleId: { type: Schema.Types.ObjectId, ref: "Cycle", required: true, index: true },
    cycleSlug: { type: String, required: true, index: true },
    cycleTitle: { type: String, required: true },
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    farmSlug: { type: String, required: true },
    farmName: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    weekNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    mortalityRate: Number,
    birdCount: Number,
    feedConsumptionKg: Number,
    fcr: Number,
    eggCount: Number,
    vaccinationStatus: String,
    imageUrls: [String],
    status: {
      type: String,
      enum: ["draft", "submitted", "published", "rejected"],
      default: "draft",
      index: true,
    },
    publishedAt: Date,
    rejectionReason: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type FieldReportDocument = InferSchemaType<typeof fieldReportSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FieldReport: Model<FieldReportDocument> =
  (mongoose.models.FieldReport as Model<FieldReportDocument> | undefined) ??
  mongoose.model<FieldReportDocument>("FieldReport", fieldReportSchema);
