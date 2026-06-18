import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const galleryItemSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "poultry_farm",
        "vegetable_farm",
        "cassava_farm",
        "palm_processing",
        "harvest",
      ],
      required: true,
      index: true,
    },
    categoryLabel: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: String,
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type GalleryItemDocument = InferSchemaType<typeof galleryItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GalleryItem: Model<GalleryItemDocument> =
  (mongoose.models.GalleryItem as Model<GalleryItemDocument> | undefined) ??
  mongoose.model<GalleryItemDocument>("GalleryItem", galleryItemSchema);
