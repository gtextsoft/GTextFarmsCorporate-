import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

import { CTA } from "@/components/marketing/CTA";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getPublicGalleryFn } from "@/lib/api/content.functions";
import { buildPageHead } from "@/lib/seo";
import {
  galleryCategoryLabels,
  type GalleryCategory,
} from "@/lib/catalog-data";

const gallerySearchSchema = z.object({
  category: z
    .enum([
      "all",
      "poultry_farm",
      "vegetable_farm",
      "cassava_farm",
      "palm_processing",
      "harvest",
    ])
    .optional(),
});

export const Route = createFileRoute("/gallery/")({
  validateSearch: gallerySearchSchema,
  loader: () => getPublicGalleryFn(),
  head: () =>
    buildPageHead({
      title: "Farm Gallery",
      description:
        "Photos from GText Farms operations across Nigeria — poultry houses, vegetable blocks, cassava fields, palm processing, harvests, and field teams.",
      path: "/gallery",
    }),
  component: GalleryPage,
});

const filters: { id: "all" | GalleryCategory; label: string }[] = [
  { id: "all", label: "All" },
  ...(
    Object.entries(galleryCategoryLabels) as [GalleryCategory, string][]
  ).map(([id, label]) => ({ id, label })),
];

function GalleryPage() {
  const items = Route.useLoaderData();
  const search = Route.useSearch();
  const [active, setActive] = useState<"all" | GalleryCategory>(search.category ?? "all");

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter((item) => item.category === active);
  }, [active, items]);

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Gallery"
            title="Inside GText Farms operations."
            sub="Poultry units, vegetable farms, cassava cultivation, palm oil processing, and harvest activities — documented from the field."
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActive(filter.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card hover:bg-secondary"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <figure
                key={item.slug}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <figcaption className="p-5">
                  <div className="text-xs font-medium uppercase tracking-wide text-forest-deep">
                    {item.categoryLabel}
                  </div>
                  <div className="mt-1 font-semibold">{item.title}</div>
                  {item.caption && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </MarketingLayout>
  );
}
