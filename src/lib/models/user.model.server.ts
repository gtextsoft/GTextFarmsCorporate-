import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import type { IdDocumentType, KycStatus, MembershipStatus, UserRole } from "@/lib/types";

const nextOfKinSchema = new Schema(
  {
    fullName: String,
    relationship: String,
    address: String,
    phone: String,
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
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
    cooperativeMember: { type: Boolean, default: false },
    membershipNumber: { type: String, unique: true, sparse: true, trim: true },
    membershipStatus: {
      type: String,
      enum: [
        "registered",
        "email_verified",
        "provisional_member",
        "full_member",
        "payment_pending",
        "funded",
        "active_investor",
      ],
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    profileCompletedAt: Date,
    admissionDate: Date,
    dateOfBirth: Date,
    gender: String,
    nationality: String,
    idType: {
      type: String,
      enum: ["nin", "passport", "voter_card", "drivers_licence", "other"],
    },
    idNumber: String,
    idDocumentUrls: [String],
    passportPhotoUrls: [String],
    occupation: String,
    employer: String,
    bylawsAcceptedAt: Date,
    nextOfKin: nextOfKinSchema,
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
  membershipStatus?: MembershipStatus;
  idType?: IdDocumentType;
  createdAt: Date;
  updatedAt: Date;
};

export const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);
