import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  catalogGallery,
  catalogProducts,
  type GalleryCategory,
  type ProductCategory,
} from "@/lib/catalog-data";
import { seedNewsPosts } from "@/lib/news-data";
import { withDatabase } from "@/lib/with-database";

export type PublicProduct = {
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  description: string;
  image: string;
  unit: string;
};

export type PublicGalleryItem = {
  slug: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  imageUrl: string;
  caption?: string;
};

function mapProduct(doc: {
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  description: string;
  image: string;
  unit?: string;
}): PublicProduct {
  return {
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    categoryLabel: doc.categoryLabel,
    description: doc.description,
    image: doc.image,
    unit: doc.unit ?? "Bulk order",
  };
}

function mapGalleryItem(doc: {
  slug: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  imageUrl: string;
  caption?: string;
}): PublicGalleryItem {
  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    categoryLabel: doc.categoryLabel,
    imageUrl: doc.imageUrl,
    caption: doc.caption,
  };
}

const fallbackProducts = catalogProducts.map((p) => mapProduct(p));
const fallbackGallery = catalogGallery.map((g) => mapGalleryItem(g));

export const getPublicProductsFn = createServerFn({ method: "GET" }).handler(async () =>
  withDatabase(async () => {
    const { Product } = await import("@/lib/models/product.model.server");
    const docs = await Product.find({ published: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return docs.map((doc) =>
      mapProduct({
        slug: doc.slug,
        name: doc.name,
        category: doc.category as ProductCategory,
        categoryLabel: doc.categoryLabel,
        description: doc.description,
        image: doc.image,
        unit: doc.unit,
      }),
    );
  }, fallbackProducts),
);

export const getPublicGalleryFn = createServerFn({ method: "GET" }).handler(async () =>
  withDatabase(async () => {
    const { GalleryItem } = await import("@/lib/models/gallery-item.model.server");
    const docs = await GalleryItem.find({ published: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return docs.map((doc) =>
      mapGalleryItem({
        slug: doc.slug,
        title: doc.title,
        category: doc.category as GalleryCategory,
        categoryLabel: doc.categoryLabel,
        imageUrl: doc.imageUrl,
        caption: doc.caption,
      }),
    );
  }, fallbackGallery),
);

export const getPublicFaqFn = createServerFn({ method: "GET" }).handler(async () =>
  withDatabase(async () => {
    const { FaqItem } = await import("@/lib/models/faq.model.server");
    const docs = await FaqItem.find({ published: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return docs.map((doc) => ({
      q: doc.question,
      a: doc.answer,
    }));
  }, []),
);

export const getPublicTeamFn = createServerFn({ method: "GET" }).handler(async () =>
  withDatabase(async () => {
    const { TeamMember } = await import("@/lib/models/team-member.model.server");
    const docs = await TeamMember.find({ published: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return docs.map((doc) => ({
      name: doc.name,
      role: doc.role,
      img: doc.img,
      yearsExperience: doc.yearsExperience ?? 0,
      bio: doc.bio ?? "",
      credentials: doc.credentials ?? [],
    }));
  }, []),
);

export type PublicNewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  categoryLabel: string;
  imageUrl?: string;
  authorName: string;
  publishedAt: string;
};

const fallbackNews: PublicNewsPost[] = seedNewsPosts.map((post, index) => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  body: post.body,
  category: post.category,
  categoryLabel: post.categoryLabel,
  imageUrl: post.imageUrl,
  authorName: post.authorName,
  publishedAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

export const getPublicNewsFn = createServerFn({ method: "GET" }).handler(async () =>
  withDatabase(async () => {
    const { NewsPost } = await import("@/lib/models/news-post.model.server");
    const docs = await NewsPost.find({ published: true })
      .sort({ sortOrder: -1, publishedAt: -1, createdAt: -1 })
      .lean();
    return docs.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      excerpt: doc.excerpt,
      body: doc.body,
      category: doc.category ?? "general",
      categoryLabel: doc.categoryLabel,
      imageUrl: doc.imageUrl,
      authorName: doc.authorName ?? "GText Farms",
      publishedAt: doc.publishedAt?.toISOString() ?? doc.createdAt?.toISOString() ?? "",
    }));
  }, fallbackNews),
);

export const getPublicNewsPostFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const fallback = fallbackNews.find((p) => p.slug === data.slug);

    return withDatabase(async () => {
      const { NewsPost } = await import("@/lib/models/news-post.model.server");
      const doc = await NewsPost.findOne({ slug: data.slug, published: true }).lean();
      if (!doc) return { error: "Post not found." as const };
      return {
        slug: doc.slug,
        title: doc.title,
        excerpt: doc.excerpt,
        body: doc.body,
        category: doc.category ?? "general",
        categoryLabel: doc.categoryLabel,
        imageUrl: doc.imageUrl,
        authorName: doc.authorName ?? "GText Farms",
        publishedAt: doc.publishedAt?.toISOString() ?? doc.createdAt?.toISOString() ?? "",
      };
    }, fallback ?? { error: "Post not found." as const });
  });
