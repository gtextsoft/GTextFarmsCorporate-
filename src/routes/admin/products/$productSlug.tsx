import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  deleteProductFn,
  getAdminProductFn,
  upsertProductFn,
} from "@/lib/api/admin.catalog.functions";
import { productCategoryLabels, type ProductCategory } from "@/lib/catalog-data";

export const Route = createFileRoute("/admin/products/$productSlug")({
  loader: async ({ params }) => {
    const product = await getAdminProductFn({ data: { slug: params.productSlug } });
    if ("error" in product) throw notFound();
    return { product };
  },
  component: AdminProductEditPage,
});

function AdminProductEditPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<ProductCategory>(product.category as ProductCategory);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to products
        </Link>
        <SectionHeader
          eyebrow="Edit product"
          title={product.name}
          sub={product.categoryLabel}
        />

        <form
          className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const cat = String(form.get("category")) as ProductCategory;
            try {
              const result = await upsertProductFn({
                data: {
                  slug: product.slug,
                  name: String(form.get("name")),
                  category: cat,
                  categoryLabel: productCategoryLabels[cat],
                  description: String(form.get("description")),
                  image: String(form.get("image")),
                  unit: String(form.get("unit")),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Product updated");
              }
            } catch {
              toast.error("Could not update product");
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={product.image} alt={product.name} className="aspect-[16/9] w-full object-cover" />
          </div>

          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              defaultValue={product.name}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
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
              defaultValue={product.description}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Image URL</span>
            <input
              name="image"
              defaultValue={product.image}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Unit / pricing label</span>
            <input
              name="unit"
              defaultValue={product.unit}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={product.sortOrder}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product.published}
              className="size-4 rounded border-border"
            />
            Published on public site
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="font-semibold text-destructive">Danger zone</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Permanently remove this product from the catalogue.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!confirm(`Delete product "${product.name}"?`)) return;
              const result = await deleteProductFn({ data: { slug: product.slug } });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Product deleted");
                await navigate({ to: "/admin/products" });
              }
            }}
          >
            Delete product
          </button>
        </div>
      </div>
    </main>
  );
}
