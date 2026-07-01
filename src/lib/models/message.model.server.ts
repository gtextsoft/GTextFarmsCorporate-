import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * A single message in the 1:1 support thread between an investor and admins.
 * The thread is implicit: all messages sharing an `investorId` form one conversation.
 */
const messageSchema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["investor", "admin"], required: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    readByInvestor: { type: Boolean, default: false, index: true },
    readByAdmin: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

messageSchema.index({ investorId: 1, createdAt: 1 });

export type MessageDocument = InferSchemaType<typeof messageSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Message: Model<MessageDocument> =
  (mongoose.models.Message as Model<MessageDocument> | undefined) ??
  mongoose.model<MessageDocument>("Message", messageSchema);
