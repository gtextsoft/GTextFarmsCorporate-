import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const contactInquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    intent: {
      type: String,
      enum: ["general", "quote", "bulk", "investment", "partnership", "careers", "press"],
      default: "general",
    },
    productSlug: String,
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true,
    },
    adminNote: String,
  },
  { timestamps: true },
);

export type ContactInquiryDocument = InferSchemaType<typeof contactInquirySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ContactInquiry: Model<ContactInquiryDocument> =
  (mongoose.models.ContactInquiry as Model<ContactInquiryDocument> | undefined) ??
  mongoose.model<ContactInquiryDocument>("ContactInquiry", contactInquirySchema);
