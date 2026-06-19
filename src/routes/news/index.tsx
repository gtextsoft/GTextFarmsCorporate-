import { Link, createFileRoute } from "@tanstack/react-router";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getPublicNewsFn } from "@/lib/api/content.functions";
import { brand, brandTitle } from "@/lib/brand";

export const Route = createFileRoute("/news/")({
  loader: () => getPublicNewsFn(),
  head: () => ({
    meta: [
      { title: brandTitle("News") },
      {
        name: "description",
        content: `Farm updates, harvest reports, and investor news from ${brand.name}.`,
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const posts = Route.useLoaderData();

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="News"
            title="Farm & company updates."
            sub="Harvest reports, expansion news, and investor updates from across GText Farms operations."
          />

          {posts.length === 0 ? (
            <p className="mt-12 text-muted-foreground">No news posts yet.</p>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="aspect-[16/10] w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="text-xs font-medium uppercase tracking-wide text-forest-deep">
                      {post.categoryLabel}
                    </div>
                    <h2 className="mt-2 font-display text-xl font-semibold leading-snug">
                      <Link
                        to="/news/$slug"
                        params={{ slug: post.slug }}
                        className="hover:text-forest-deep"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.authorName}</span>
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
