import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getInvestorActivityFeedFn } from "@/lib/api/field-reports.functions";

export const Route = createFileRoute("/app/activity/")({
  head: () => ({ meta: [{ title: "Farm Updates — GText Farms" }] }),
  loader: () => getInvestorActivityFeedFn(),
  component: ActivityPage,
});

function ActivityPage() {
  const feed = Route.useLoaderData();

  if ("error" in feed) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{feed.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          eyebrow="Farm transparency"
          title="Weekly field updates."
          sub="Published reports from verified field officers for cycles you've invested in."
        />

        {feed.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No published reports yet for your cycles.{" "}
            <Link to="/app/invest" className="font-medium text-forest-deep hover:underline">
              Browse opportunities
            </Link>
            .
          </p>
        ) : (
          <div className="mt-10 space-y-6">
            {feed.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Week {report.weekNumber} · {report.farmName}
                  </span>
                  <span>
                    {report.publishedAt
                      ? new Date(report.publishedAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl">{report.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{report.cycleTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">By {report.authorName}</p>
                <p className="mt-4 text-sm leading-relaxed">{report.body}</p>

                {(report.mortalityRate != null || report.fcr != null || report.birdCount != null) && (
                  <dl className="mt-4 flex flex-wrap gap-4 text-sm">
                    {report.mortalityRate != null && (
                      <div>
                        <dt className="text-muted-foreground">Mortality</dt>
                        <dd className="font-numeric font-semibold text-forest-deep">{report.mortalityRate}%</dd>
                      </div>
                    )}
                    {report.fcr != null && (
                      <div>
                        <dt className="text-muted-foreground">FCR</dt>
                        <dd className="font-numeric font-semibold">{report.fcr}</dd>
                      </div>
                    )}
                    {report.birdCount != null && (
                      <div>
                        <dt className="text-muted-foreground">Birds</dt>
                        <dd className="font-numeric font-semibold">{report.birdCount.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {report.imageUrls.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {report.imageUrls.map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt=""
                        className="aspect-video w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}

                <Link
                  to="/app/invest/opportunity/$cycleSlug"
                  params={{ cycleSlug: report.cycleSlug }}
                  className="mt-4 inline-flex text-sm font-medium text-forest-deep hover:underline"
                >
                  View cycle →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
