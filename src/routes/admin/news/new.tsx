import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { upsertNewsFn } from "@/lib/api/admin.news.functions";
import { imagePaths } from "@/lib/image-paths";
import { newsCategoryLabels, type NewsCategory } from "@/lib/news-data";

export const Route = createFileRoute("/admin/news/new")({
  component: AdminNewNewsPage,
});

function AdminNewNewsPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<NewsCategory>("general");

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/news" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to news
        </Link>
        <SectionHeader eyebrow="New post" title="Add a news article." sub="" />

        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const cat = String(form.get("category")) as NewsCategory;
            try {
              const result = await upsertNewsFn({
                data: {
                  slug: String(form.get("slug")),
                  title: String(form.get("title")),
                  excerpt: String(form.get("excerpt")),
                  body: String(form.get("body")),
                  category: cat,
                  categoryLabel: newsCategoryLabels[cat],
                  imageUrl: String(form.get("imageUrl")) || imagePaths.farmAerial,
                  authorName: String(form.get("authorName")) || "GText Farms",
                  publishedAt: new Date().toISOString(),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Post created");
                await navigate({
                  to: "/admin/news/$postSlug",
                  params: { postSlug: String(form.get("slug")) },
                });
              }
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Slug (URL)</span>
            <input name="slug" required placeholder="q2-harvest-update" className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
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
              onChange={(e) => setCategory(e.target.value as NewsCategory)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            >
              {(Object.entries(newsCategoryLabels) as [NewsCategory, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Excerpt</span>
            <textarea name="excerpt" rows={2} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Body</span>
            <textarea name="body" rows={6} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Image URL</span>
            <input name="imageUrl" defaultValue={imagePaths.farmAerial} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Author</span>
            <input name="authorName" defaultValue="GText Farms" className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={0} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked className="size-4 rounded border-border" />
            Published
          </label>
          <button type="submit" disabled={pending} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {pending ? "Creating…" : "Create post"}
          </button>
        </form>
      </div>
    </main>
  );
}
