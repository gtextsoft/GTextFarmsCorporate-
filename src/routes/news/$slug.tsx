import { Link, createFileRoute } from "@tanstack/react-router";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { getPublicNewsPostFn } from "@/lib/api/content.functions";
import { brandTitle } from "@/lib/brand";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => getPublicNewsPostFn({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData && "title" in loaderData
            ? brandTitle(loaderData.title)
            : brandTitle("News"),
      },
    ],
  }),
  component: NewsPostPage,
});

function NewsPostPage() {
  const post = Route.useLoaderData();

  if ("error" in post) {
    return (
      <MarketingLayout>
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-2xl">Post not found</h1>
          <Link to="/news" className="mt-4 inline-block text-forest-deep hover:underline">
            ← Back to news
          </Link>
        </main>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <article className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground">
            ← All news
          </Link>

          <div className="mt-6 text-xs font-medium uppercase tracking-wide text-forest-deep">
            {post.categoryLabel}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{post.authorName}</span>
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          )}

          <p className="mt-8 text-lg text-muted-foreground">{post.excerpt}</p>

          <div className="prose prose-neutral mt-8 max-w-none text-foreground">
            {post.body.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mt-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </MarketingLayout>
  );
}
