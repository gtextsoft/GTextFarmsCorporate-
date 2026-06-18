import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";

export const listAdminFaqFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { FaqItem } = await import("@/lib/models/faq.model.server");

  await connectDB();
  const docs = await FaqItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    question: doc.question,
    answer: doc.answer,
    sortOrder: doc.sortOrder ?? 0,
    published: doc.published !== false,
  }));
});

const upsertFaqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const upsertFaqFn = createServerFn({ method: "POST" })
  .validator(upsertFaqSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FaqItem } = await import("@/lib/models/faq.model.server");

    await connectDB();
    if (data.id) {
      await FaqItem.findByIdAndUpdate(data.id, {
        $set: {
          question: data.question,
          answer: data.answer,
          sortOrder: data.sortOrder ?? 0,
          published: data.published ?? true,
        },
      });
      return { success: true as const, id: data.id };
    }

    const doc = await FaqItem.create({
      question: data.question,
      answer: data.answer,
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
    });
    return { success: true as const, id: doc._id.toString() };
  });

export const deleteFaqFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FaqItem } = await import("@/lib/models/faq.model.server");

    await connectDB();
    const res = await FaqItem.deleteOne({ _id: data.id });
    if (res.deletedCount === 0) return { error: "FAQ item not found." as const };
    return { success: true as const };
  });

export const listAdminTeamFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { TeamMember } = await import("@/lib/models/team-member.model.server");

  await connectDB();
  const docs = await TeamMember.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    role: doc.role,
    img: doc.img,
    yearsExperience: doc.yearsExperience ?? 0,
    bio: doc.bio ?? "",
    credentials: doc.credentials ?? [],
    sortOrder: doc.sortOrder ?? 0,
    published: doc.published !== false,
  }));
});

const upsertTeamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  role: z.string().min(1),
  img: z.string().min(1),
  yearsExperience: z.number().optional(),
  bio: z.string().optional(),
  credentials: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const upsertTeamMemberFn = createServerFn({ method: "POST" })
  .validator(upsertTeamSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { TeamMember } = await import("@/lib/models/team-member.model.server");

    await connectDB();
    const payload = {
      name: data.name,
      role: data.role,
      img: data.img,
      yearsExperience: data.yearsExperience,
      bio: data.bio,
      credentials: data.credentials ?? [],
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
    };

    if (data.id) {
      await TeamMember.findByIdAndUpdate(data.id, { $set: payload });
      return { success: true as const, id: data.id };
    }

    const doc = await TeamMember.create(payload);
    return { success: true as const, id: doc._id.toString() };
  });

export const deleteTeamMemberFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { TeamMember } = await import("@/lib/models/team-member.model.server");

    await connectDB();
    const res = await TeamMember.deleteOne({ _id: data.id });
    if (res.deletedCount === 0) return { error: "Team member not found." as const };
    return { success: true as const };
  });

export const getAdminFaqFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FaqItem } = await import("@/lib/models/faq.model.server");

    await connectDB();
    const doc = await FaqItem.findById(data.id).lean();
    if (!doc) return { error: "FAQ item not found." as const };
    return {
      id: doc._id.toString(),
      question: doc.question,
      answer: doc.answer,
      sortOrder: doc.sortOrder ?? 0,
      published: doc.published !== false,
    };
  });

export const getAdminTeamMemberFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { TeamMember } = await import("@/lib/models/team-member.model.server");

    await connectDB();
    const doc = await TeamMember.findById(data.id).lean();
    if (!doc) return { error: "Team member not found." as const };
    return {
      id: doc._id.toString(),
      name: doc.name,
      role: doc.role,
      img: doc.img,
      yearsExperience: doc.yearsExperience ?? 0,
      bio: doc.bio ?? "",
      credentials: (doc.credentials ?? []).join("\n"),
      sortOrder: doc.sortOrder ?? 0,
      published: doc.published !== false,
    };
  });
