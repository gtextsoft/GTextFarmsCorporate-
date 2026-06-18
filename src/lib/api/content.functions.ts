import { createServerFn } from "@tanstack/react-start";

import {
  catalogGallery,
  catalogProducts,
  type GalleryCategory,
  type ProductCategory,
} from "@/lib/catalog-data";
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
