import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const completedCycleSchema = new Schema(
  {
    cycleId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    farmName: { type: String, required: true },
    type: { type: String, required: true },
    roiProjected: { type: String, required: true },
    roiDelivered: { type: String, required: true },
    status: { type: String, enum: ["Completed", "Closed"], default: "Completed" },
    completedDate: { type: String, required: true },
    investors: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CompletedCycleDocument = InferSchemaType<typeof completedCycleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CompletedCycleRecord: Model<CompletedCycleDocument> =
  (mongoose.models.CompletedCycle as Model<CompletedCycleDocument> | undefined) ??
  mongoose.model<CompletedCycleDocument>("CompletedCycle", completedCycleSchema);
