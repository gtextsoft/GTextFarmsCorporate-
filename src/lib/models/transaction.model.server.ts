import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const transactionSchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "investment", "return_payout", "refund", "fee", "adjustment"],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
    externalReference: { type: String, index: true },
    investmentId: { type: Schema.Types.ObjectId, ref: "Investment" },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Transaction: Model<TransactionDocument> =
  (mongoose.models.Transaction as Model<TransactionDocument> | undefined) ??
  mongoose.model<TransactionDocument>("Transaction", transactionSchema);
