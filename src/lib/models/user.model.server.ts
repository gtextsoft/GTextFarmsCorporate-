import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import type { KycStatus, UserRole } from "@/lib/types";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["investor", "admin", "field_officer", "super_admin"],
      default: "investor",
    },
    kycStatus: {
      type: String,
      enum: ["pending", "submitted", "verified", "rejected"],
      default: "pending",
    },
    address: String,
    city: String,
    state: String,
    bvnHash: { type: String, select: false },
    ninHash: { type: String, select: false },
    kycRejectionReason: String,
    bankName: String,
    accountNumber: String,
    accountName: String,
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  role: UserRole;
  kycStatus: KycStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);
