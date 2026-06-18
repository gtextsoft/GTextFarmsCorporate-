import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const withdrawalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "rejected"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
    adminNote: String,
    processedAt: Date,
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type WithdrawalDocument = InferSchemaType<typeof withdrawalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Withdrawal: Model<WithdrawalDocument> =
  (mongoose.models.Withdrawal as Model<WithdrawalDocument> | undefined) ??
  mongoose.model<WithdrawalDocument>("Withdrawal", withdrawalSchema);
