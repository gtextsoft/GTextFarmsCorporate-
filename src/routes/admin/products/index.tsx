import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminProductsFn } from "@/lib/api/admin.catalog.functions";

export const Route = createFileRoute("/admin/products/")({
  loader: () => listAdminProductsFn(),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const products = Route.useLoaderData();

  if ("error" in products) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{products.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="Products."
          sub="Manage the public products catalogue — poultry, vegetables, and processed goods."
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add product
          </Link>
          <Link
            to="/products"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            View public page
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="hidden px-4 py-3 sm:table-cell">Category</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No products yet. Run <code className="text-xs">npm run db:seed</code> or add one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.slug}>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {product.categoryLabel}
                    </td>
                    <td className="px-4 py-3">{product.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.published ? "text-forest-deep" : "text-muted-foreground"
                        }
                      >
                        {product.published ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/admin/products/$productSlug"
                        params={{ productSlug: product.slug }}
                        className="font-medium text-forest-deep hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
