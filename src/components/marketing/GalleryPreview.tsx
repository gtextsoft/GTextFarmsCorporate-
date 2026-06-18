import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { PublicGalleryItem } from "@/lib/api/content.functions";

export function GalleryPreview({ items }: { items: PublicGalleryItem[] }) {
  const preview = items.slice(0, 4);
  if (preview.length === 0) return null;

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Gallery"
            title="Real operations. Real photos."
            sub="Poultry units, vegetable farms, cassava blocks, palm processing, and harvest activities across GText Farms."
          />
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            View full gallery <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((item) => (
            <Link
              key={item.slug}
              to="/gallery"
              search={{ category: item.category }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-forest-deep">
                  {item.categoryLabel}
                </div>
                <div className="mt-1 font-medium">{item.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
