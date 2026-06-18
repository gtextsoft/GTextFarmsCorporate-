import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  deleteGalleryItemFn,
  getAdminGalleryItemFn,
  upsertGalleryItemFn,
} from "@/lib/api/admin.catalog.functions";
import { galleryCategoryLabels, type GalleryCategory } from "@/lib/catalog-data";

export const Route = createFileRoute("/admin/gallery/$itemSlug")({
  loader: async ({ params }) => {
    const item = await getAdminGalleryItemFn({ data: { slug: params.itemSlug } });
    if ("error" in item) throw notFound();
    return { item };
  },
  component: AdminGalleryEditPage,
});

function AdminGalleryEditPage() {
  const { item } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<GalleryCategory>(item.category as GalleryCategory);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/gallery" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to gallery
        </Link>
        <SectionHeader eyebrow="Edit photo" title={item.title} sub={item.categoryLabel} />

        <form
          className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const cat = String(form.get("category")) as GalleryCategory;
            try {
              const result = await upsertGalleryItemFn({
                data: {
                  slug: item.slug,
                  title: String(form.get("title")),
                  category: cat,
                  categoryLabel: galleryCategoryLabels[cat],
                  imageUrl: String(form.get("imageUrl")),
                  caption: String(form.get("caption")),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Gallery item updated");
              }
            } catch {
              toast.error("Could not update gallery item");
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={item.imageUrl} alt={item.title} className="aspect-[4/3] w-full object-cover" />
          </div>

          <label className="block text-sm">
            <span className="font-medium">Title</span>
            <input
              name="title"
              defaultValue={item.title}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
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
              defaultValue={item.imageUrl}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Caption</span>
            <textarea
              name="caption"
              rows={3}
              defaultValue={item.caption}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={item.sortOrder}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={item.published}
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
            Permanently remove this photo from the gallery.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!confirm(`Delete "${item.title}"?`)) return;
              const result = await deleteGalleryItemFn({ data: { slug: item.slug } });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Gallery item deleted");
                await navigate({ to: "/admin/gallery" });
              }
            }}
          >
            Delete photo
          </button>
        </div>
      </div>
    </main>
  );
}
