import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const manualPaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipNumber: { type: String },
    // What the payment is for. Both use the same manual bank-transfer flow.
    purpose: {
      type: String,
      enum: ["entrance_fee", "investment_deposit"],
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    payerAccountName: { type: String, required: true },
    payerBankName: { type: String, required: true },
    transferReference: { type: String },
    transferDate: { type: Date },
    receiptUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reference: { type: String, required: true, unique: true },
    rejectionReason: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// At most one pending payment per (user, purpose) — stops a member queuing two
// approvable payments of the same type concurrently.
manualPaymentSchema.index(
  { userId: 1, purpose: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);

export type ManualPaymentDocument = InferSchemaType<typeof manualPaymentSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const ManualPayment: Model<ManualPaymentDocument> =
  (mongoose.models.ManualPayment as Model<ManualPaymentDocument> | undefined) ??
  mongoose.model<ManualPaymentDocument>("ManualPayment", manualPaymentSchema);
