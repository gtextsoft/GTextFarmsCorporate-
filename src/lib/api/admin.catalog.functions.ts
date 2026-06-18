import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";

const productCategorySchema = z.enum(["poultry", "vegetables", "processed"]);

const upsertProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: productCategorySchema,
  categoryLabel: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  unit: z.string().optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const listAdminProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Product } = await import("@/lib/models/product.model.server");

  await connectDB();
  const docs = await Product.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return docs.map((doc) => ({
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    categoryLabel: doc.categoryLabel,
    published: doc.published !== false,
    sortOrder: doc.sortOrder ?? 0,
    updatedAt: doc.updatedAt?.toISOString?.() ?? "",
  }));
});

export const getAdminProductFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Product } = await import("@/lib/models/product.model.server");

    await connectDB();
    const doc = await Product.findOne({ slug: data.slug }).lean();
    if (!doc) return { error: "Product not found." as const };

    return {
      slug: doc.slug,
      name: doc.name,
      category: doc.category,
      categoryLabel: doc.categoryLabel,
      description: doc.description,
      image: doc.image,
      unit: doc.unit ?? "",
      sortOrder: doc.sortOrder ?? 0,
      published: doc.published !== false,
    };
  });

export const upsertProductFn = createServerFn({ method: "POST" })
  .validator(upsertProductSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Product } = await import("@/lib/models/product.model.server");

    await connectDB();
    await Product.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          ...data,
          unit: data.unit?.trim() || "Bulk order",
          published: data.published ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      },
      { upsert: true, new: true },
    );

    return { success: true as const };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Product } = await import("@/lib/models/product.model.server");

    await connectDB();
    const res = await Product.deleteOne({ slug: data.slug });
    if (res.deletedCount === 0) return { error: "Product not found." as const };
    return { success: true as const };
  });

const galleryCategorySchema = z.enum([
  "poultry_farm",
  "vegetable_farm",
  "cassava_farm",
  "palm_processing",
  "harvest",
]);

const upsertGalleryItemSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  category: galleryCategorySchema,
  categoryLabel: z.string().min(1),
  imageUrl: z.string().min(1),
  caption: z.string().optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export const listAdminGalleryFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { GalleryItem } = await import("@/lib/models/gallery-item.model.server");

  await connectDB();
  const docs = await GalleryItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    categoryLabel: doc.categoryLabel,
    published: doc.published !== false,
    sortOrder: doc.sortOrder ?? 0,
    updatedAt: doc.updatedAt?.toISOString?.() ?? "",
  }));
});

export const getAdminGalleryItemFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { GalleryItem } = await import("@/lib/models/gallery-item.model.server");

    await connectDB();
    const doc = await GalleryItem.findOne({ slug: data.slug }).lean();
    if (!doc) return { error: "Gallery item not found." as const };

    return {
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      categoryLabel: doc.categoryLabel,
      imageUrl: doc.imageUrl,
      caption: doc.caption ?? "",
      sortOrder: doc.sortOrder ?? 0,
      published: doc.published !== false,
    };
  });

export const upsertGalleryItemFn = createServerFn({ method: "POST" })
  .validator(upsertGalleryItemSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { GalleryItem } = await import("@/lib/models/gallery-item.model.server");

    await connectDB();
    await GalleryItem.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          ...data,
          caption: data.caption?.trim() || undefined,
          published: data.published ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      },
      { upsert: true, new: true },
    );

    return { success: true as const };
  });

export const deleteGalleryItemFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { GalleryItem } = await import("@/lib/models/gallery-item.model.server");

    await connectDB();
    const res = await GalleryItem.deleteOne({ slug: data.slug });
    if (res.deletedCount === 0) return { error: "Gallery item not found." as const };
    return { success: true as const };
  });

