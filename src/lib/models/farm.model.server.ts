import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const farmVerificationSchema = new Schema(
  {
    farmVisited: { type: Boolean, default: false },
    vetVerified: { type: Boolean, default: false },
    cacVerified: { type: Boolean, default: false },
    geoTagged: { type: Boolean, default: false },
    lastInspection: String,
  },
  { _id: false },
);

const farmSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true },
    capacity: String,
    birdCount: String,
    mortality: String,
    fcr: String,
    cyclesPerYear: Number,
    heroImage: String,
    description: String,
    activeCycleSlug: String,
    ownershipModel: String,
    operatorName: String,
    managerName: String,
    verification: farmVerificationSchema,
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type FarmDocument = InferSchemaType<typeof farmSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Farm: Model<FarmDocument> =
  (mongoose.models.Farm as Model<FarmDocument> | undefined) ??
  mongoose.model<FarmDocument>("Farm", farmSchema);
