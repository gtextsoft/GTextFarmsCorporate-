import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminProductsFn, upsertProductFn } from "@/lib/api/admin.catalog.functions";
import { productCategoryLabels, type ProductCategory } from "@/lib/catalog-data";
import { imagePaths } from "@/lib/image-paths";

export const Route = createFileRoute("/admin/products/new")({
  loader: () => listAdminProductsFn(),
  component: AdminNewProductPage,
});

function AdminNewProductPage() {
  const navigate = useNavigate();
  const products = Route.useLoaderData();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<ProductCategory>("poultry");

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to products
        </Link>
        <SectionHeader
          eyebrow="New product"
          title="Add a product."
          sub="Appears on the public /products page when published."
        />

        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const cat = String(form.get("category")) as ProductCategory;
            try {
              const result = await upsertProductFn({
                data: {
                  slug: String(form.get("slug")),
                  name: String(form.get("name")),
                  category: cat,
                  categoryLabel: productCategoryLabels[cat],
                  description: String(form.get("description")),
                  image: String(form.get("image")) || imagePaths.eggLine,
                  unit: String(form.get("unit")),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Product created");
                await navigate({
                  to: "/admin/products/$productSlug",
                  params: { productSlug: String(form.get("slug")) },
                });
              }
            } catch {
              toast.error("Could not create product");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Slug (URL)</span>
            <input
              name="slug"
              required
              placeholder="fresh-eggs"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input name="name" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Category</span>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            >
              {(Object.entries(productCategoryLabels) as [ProductCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Description</span>
            <textarea
              name="description"
              rows={4}
              required
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Image URL</span>
            <input
              name="image"
              defaultValue={imagePaths.eggLine}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Unit / pricing label</span>
            <input
              name="unit"
              placeholder="per crate"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order (lower = first)</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked className="size-4 rounded border-border" />
            Publish on public site
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create product"}
          </button>
        </form>

        {"error" in products ? null : products.length > 0 ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Existing slugs: {products.map((p) => p.slug).join(", ")}
          </p>
        ) : null}
      </div>
    </main>
  );
}
