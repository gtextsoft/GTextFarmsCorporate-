import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const newsPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ["farm_activity", "harvest", "expansion", "investor_update", "general"],
      default: "general",
      index: true,
    },
    categoryLabel: { type: String, required: true },
    imageUrl: String,
    authorName: { type: String, default: "GText Farms" },
    publishedAt: Date,
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type NewsPostDocument = InferSchemaType<typeof newsPostSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const NewsPost: Model<NewsPostDocument> =
  (mongoose.models.NewsPost as Model<NewsPostDocument> | undefined) ??
  mongoose.model<NewsPostDocument>("NewsPost", newsPostSchema);
