import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const membershipCounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "coop" },
    lastNumber: { type: Number, required: true },
  },
  { timestamps: true },
);

export type MembershipCounterDocument = InferSchemaType<typeof membershipCounterSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MembershipCounter: Model<MembershipCounterDocument> =
  (mongoose.models.MembershipCounter as Model<MembershipCounterDocument> | undefined) ??
  mongoose.model<MembershipCounterDocument>("MembershipCounter", membershipCounterSchema);
