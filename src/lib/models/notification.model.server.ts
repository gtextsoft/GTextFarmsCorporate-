import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["deposit", "investment", "kyc", "field_report", "withdrawal", "system"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false, index: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Notification: Model<NotificationDocument> =
  (mongoose.models.Notification as Model<NotificationDocument> | undefined) ??
  mongoose.model<NotificationDocument>("Notification", notificationSchema);
