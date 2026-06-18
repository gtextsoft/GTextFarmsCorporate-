import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminGalleryFn } from "@/lib/api/admin.catalog.functions";

export const Route = createFileRoute("/admin/gallery/")({
  loader: () => listAdminGalleryFn(),
  component: AdminGalleryPage,
});

function AdminGalleryPage() {
  const items = Route.useLoaderData();

  if ("error" in items) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{items.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="Gallery."
          sub="Manage photos shown on /gallery and the home page preview."
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/admin/gallery/new"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add photo
          </Link>
          <Link
            to="/gallery"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            View public page
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 sm:table-cell">Category</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No gallery items yet. Run <code className="text-xs">npm run db:seed</code> or add one.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.slug}>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {item.categoryLabel}
                    </td>
                    <td className="px-4 py-3">{item.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={item.published ? "text-forest-deep" : "text-muted-foreground"}
                      >
                        {item.published ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/admin/gallery/$itemSlug"
                        params={{ itemSlug: item.slug }}
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
