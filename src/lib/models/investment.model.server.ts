import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const investmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cycleId: { type: Schema.Types.ObjectId, ref: "Cycle", required: true },
    cycleSlug: { type: String, required: true },
    cycleTitle: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "confirmed",
    },
    certificateNumber: { type: String, unique: true, sparse: true },
    expectedReturnMin: Number,
    expectedReturnMax: Number,
    actualReturn: Number,
    investedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true },
);

investmentSchema.index({ userId: 1, cycleId: 1 }, { unique: true });

export type InvestmentDocument = InferSchemaType<typeof investmentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Investment: Model<InvestmentDocument> =
  (mongoose.models.Investment as Model<InvestmentDocument> | undefined) ??
  mongoose.model<InvestmentDocument>("Investment", investmentSchema);
