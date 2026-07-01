import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { z } from "zod";

import { CTA } from "@/components/marketing/CTA";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getPublicProductsFn } from "@/lib/api/content.functions";
import { brand } from "@/lib/brand";
import { buildPageHead } from "@/lib/seo";
import {
  productCategoryLabels,
  type ProductCategory,
} from "@/lib/catalog-data";

const categoryFilterSchema = z.object({
  category: z.enum(["all", "poultry", "vegetables", "processed"]).optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: categoryFilterSchema,
  loader: () => getPublicProductsFn(),
  head: () =>
    buildPageHead({
      title: "Farm-Fresh Products",
      description:
        "Order premium Nigerian farm-fresh produce from GText Farms — eggs, broilers, tomatoes, peppers, rice, yam, palm oil, garri, and cassava products. Bulk and retail supply nationwide.",
      path: "/products",
    }),
  component: ProductsPage,
});

const filters: { id: "all" | ProductCategory; label: string }[] = [
  { id: "all", label: "All products" },
  { id: "poultry", label: productCategoryLabels.poultry },
  { id: "vegetables", label: productCategoryLabels.vegetables },
  { id: "processed", label: productCategoryLabels.processed },
];

function ProductsPage() {
  const products = Route.useLoaderData();
  const search = Route.useSearch();
  const [active, setActive] = useState<"all" | ProductCategory>(search.category ?? "all");

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof products>();
    for (const product of filtered) {
      const list = map.get(product.categoryLabel) ?? [];
      list.push(product);
      map.set(product.categoryLabel, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Products"
            title="Farm-fresh produce & processed goods."
            sub={`${brand.name} supplies poultry, vegetables, palm oil, and cassava products to buyers, distributors, and food processors across Nigeria.`}
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

          <div className="mt-12 space-y-14">
            {grouped.map(([categoryLabel, items]) => (
              <div key={categoryLabel}>
                <h2 className="font-display text-3xl">{categoryLabel}</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <article
                      key={product.slug}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                        <p className="mt-3 text-xs font-medium text-forest-deep">
                          Pricing: <span className="font-numeric font-semibold">{product.unit}</span>
                        </p>
                        <Link
                          to="/contact"
                          search={{ product: product.slug, intent: "quote" }}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-deep hover:underline"
                        >
                          Request quote <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-forest/30 bg-forest/5 p-8 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <h3 className="font-display text-2xl">Bulk orders & distribution</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Need recurring supply for retail, food service, or export? Our sales team handles
                volume pricing, delivery schedules, and quality documentation.
              </p>
            </div>
            <Link
              to="/contact"
              search={{ intent: "bulk" }}
              className="mt-6 inline-flex shrink-0 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 md:mt-0"
            >
              Request bulk order
            </Link>
          </div>
        </div>
      </section>
      <CTA />
    </MarketingLayout>
  );
}
