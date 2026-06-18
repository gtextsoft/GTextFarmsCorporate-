import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminGalleryFn, upsertGalleryItemFn } from "@/lib/api/admin.catalog.functions";
import { galleryCategoryLabels, type GalleryCategory } from "@/lib/catalog-data";
import { imagePaths } from "@/lib/image-paths";

export const Route = createFileRoute("/admin/gallery/new")({
  loader: () => listAdminGalleryFn(),
  component: AdminNewGalleryPage,
});

function AdminNewGalleryPage() {
  const navigate = useNavigate();
  const items = Route.useLoaderData();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<GalleryCategory>("poultry_farm");

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/gallery" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to gallery
        </Link>
        <SectionHeader
          eyebrow="New photo"
          title="Add gallery item."
          sub="Image URL for now — file upload can be added later."
        />

        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const cat = String(form.get("category")) as GalleryCategory;
            try {
              const result = await upsertGalleryItemFn({
                data: {
                  slug: String(form.get("slug")),
                  title: String(form.get("title")),
                  category: cat,
                  categoryLabel: galleryCategoryLabels[cat],
                  imageUrl: String(form.get("imageUrl")) || imagePaths.heroFarm,
                  caption: String(form.get("caption")),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Gallery item created");
                await navigate({
                  to: "/admin/gallery/$itemSlug",
                  params: { itemSlug: String(form.get("slug")) },
                });
              }
            } catch {
              toast.error("Could not create gallery item");
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
              placeholder="poultry-house-interior"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Title</span>
            <input name="title" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Category</span>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryCategory)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            >
              {(Object.entries(galleryCategoryLabels) as [GalleryCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Image URL</span>
            <input
              name="imageUrl"
              defaultValue={imagePaths.heroFarm}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Caption</span>
            <textarea
              name="caption"
              rows={3}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
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
            {pending ? "Creating…" : "Create gallery item"}
          </button>
        </form>

        {"error" in items ? null : items.length > 0 ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Existing slugs: {items.map((i) => i.slug).join(", ")}
          </p>
        ) : null}
      </div>
    </main>
  );
}
