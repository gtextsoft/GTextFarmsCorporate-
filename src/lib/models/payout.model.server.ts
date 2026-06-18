import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const payoutSchema = new Schema(
  {
    cycleId: { type: String, required: true, unique: true },
    cycleTitle: { type: String, required: true },
    investors: { type: Number, default: 0 },
    capitalReturned: { type: String, required: true },
    profitPaid: { type: String, required: true },
    payoutDate: { type: String, required: true },
    verified: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type PayoutDocument = InferSchemaType<typeof payoutSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Payout: Model<PayoutDocument> =
  (mongoose.models.Payout as Model<PayoutDocument> | undefined) ??
  mongoose.model<PayoutDocument>("Payout", payoutSchema);
