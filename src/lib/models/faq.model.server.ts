import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type FaqDocument = InferSchemaType<typeof faqSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FaqItem: Model<FaqDocument> =
  (mongoose.models.FaqItem as Model<FaqDocument> | undefined) ??
  mongoose.model<FaqDocument>("FaqItem", faqSchema);
