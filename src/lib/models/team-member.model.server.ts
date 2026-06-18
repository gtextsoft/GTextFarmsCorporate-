import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    img: { type: String, required: true },
    yearsExperience: Number,
    bio: String,
    credentials: [String],
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type TeamMemberDocument = InferSchemaType<typeof teamMemberSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TeamMember: Model<TeamMemberDocument> =
  (mongoose.models.TeamMember as Model<TeamMemberDocument> | undefined) ??
  mongoose.model<TeamMemberDocument>("TeamMember", teamMemberSchema);
