import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";
import { newsCategoryLabels } from "@/lib/news-data";

const newsCategorySchema = z.enum([
  "farm_activity",
  "harvest",
  "expansion",
  "investor_update",
  "general",
]);

const upsertNewsSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  category: newsCategorySchema,
  categoryLabel: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  authorName: z.string().optional(),
  publishedAt: z.string().optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const listAdminNewsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { NewsPost } = await import("@/lib/models/news-post.model.server");

  await connectDB();
  const docs = await NewsPost.find().sort({ sortOrder: -1, publishedAt: -1, createdAt: -1 }).lean();

  return docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    categoryLabel: doc.categoryLabel,
    published: doc.published !== false,
    sortOrder: doc.sortOrder ?? 0,
    publishedAt: doc.publishedAt?.toISOString() ?? "",
    updatedAt: doc.updatedAt?.toISOString() ?? "",
  }));
});

export const getAdminNewsFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { NewsPost } = await import("@/lib/models/news-post.model.server");

    await connectDB();
    const doc = await NewsPost.findOne({ slug: data.slug }).lean();
    if (!doc) return { error: "Post not found." as const };

    return {
      slug: doc.slug,
      title: doc.title,
      excerpt: doc.excerpt,
      body: doc.body,
      category: doc.category,
      categoryLabel: doc.categoryLabel,
      imageUrl: doc.imageUrl ?? "",
      authorName: doc.authorName ?? "GText Farms",
      publishedAt: doc.publishedAt?.toISOString() ?? "",
      sortOrder: doc.sortOrder ?? 0,
      published: doc.published !== false,
    };
  });

export const upsertNewsFn = createServerFn({ method: "POST" })
  .validator(upsertNewsSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { NewsPost } = await import("@/lib/models/news-post.model.server");

    await connectDB();

    const categoryLabel =
      data.categoryLabel ?? newsCategoryLabels[data.category as keyof typeof newsCategoryLabels];

    await NewsPost.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          title: data.title,
          excerpt: data.excerpt,
          body: data.body,
          category: data.category,
          categoryLabel,
          imageUrl: data.imageUrl || undefined,
          authorName: data.authorName ?? "GText Farms",
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
          sortOrder: data.sortOrder ?? 0,
          published: data.published ?? true,
        },
      },
      { upsert: true, new: true },
    );

    return { success: true as const };
  });

export const deleteNewsFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { NewsPost } = await import("@/lib/models/news-post.model.server");

    await connectDB();
    const res = await NewsPost.deleteOne({ slug: data.slug });
    if (res.deletedCount === 0) return { error: "Post not found." as const };
    return { success: true as const };
  });
