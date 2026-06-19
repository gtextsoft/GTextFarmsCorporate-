import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { deleteNewsFn, getAdminNewsFn, upsertNewsFn } from "@/lib/api/admin.news.functions";
import { newsCategoryLabels, type NewsCategory } from "@/lib/news-data";

export const Route = createFileRoute("/admin/news/$postSlug")({
  loader: async ({ params }) => {
    const post = await getAdminNewsFn({ data: { slug: params.postSlug } });
    if ("error" in post) throw notFound();
    return { post };
  },
  component: AdminNewsEditPage,
});

function AdminNewsEditPage() {
  const { post } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<NewsCategory>(post.category as NewsCategory);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/news" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to news
        </Link>
        <SectionHeader eyebrow="Edit post" title={post.title} sub={post.categoryLabel} />

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
                  slug: post.slug,
                  title: String(form.get("title")),
                  excerpt: String(form.get("excerpt")),
                  body: String(form.get("body")),
                  category: cat,
                  categoryLabel: newsCategoryLabels[cat],
                  imageUrl: String(form.get("imageUrl")),
                  authorName: String(form.get("authorName")),
                  publishedAt: post.publishedAt || new Date().toISOString(),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) toast.error(result.error);
              else toast.success("Post updated");
            } finally {
              setPending(false);
            }
          }}
        >
          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
          )}

          <label className="block text-sm">
            <span className="font-medium">Title</span>
            <input name="title" defaultValue={post.title} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
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
            <textarea name="excerpt" rows={2} defaultValue={post.excerpt} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Body</span>
            <textarea name="body" rows={8} defaultValue={post.body} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Image URL</span>
            <input name="imageUrl" defaultValue={post.imageUrl} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Author</span>
            <input name="authorName" defaultValue={post.authorName} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={post.sortOrder} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={post.published} className="size-4 rounded border-border" />
            Published
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Saving…" : "Save changes"}
            </button>
            <Link
              to="/news/$slug"
              params={{ slug: post.slug }}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Preview
            </Link>
          </div>
        </form>

        <button
          type="button"
          className="mt-6 text-sm text-destructive hover:underline"
          onClick={async () => {
            if (!confirm("Delete this post permanently?")) return;
            const result = await deleteNewsFn({ data: { slug: post.slug } });
            if ("error" in result && result.error) toast.error(result.error);
            else {
              toast.success("Post deleted");
              await navigate({ to: "/admin/news" });
            }
          }}
        >
          Delete post
        </button>
      </div>
    </main>
  );
}
