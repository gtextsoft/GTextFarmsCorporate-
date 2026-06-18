import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    lockedBalance: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true },
);

export type WalletDocument = InferSchemaType<typeof walletSchema> & {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};

export const Wallet: Model<WalletDocument> =
  (mongoose.models.Wallet as Model<WalletDocument> | undefined) ??
  mongoose.model<WalletDocument>("Wallet", walletSchema);
