import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { viewMyFieldReportFn } from "@/lib/api/field.reports.functions";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Awaiting review",
  published: "Published",
  rejected: "Needs revision",
};

export const Route = createFileRoute("/field/reports/$reportId/view")({
  loader: async ({ params }) => {
    const report = await viewMyFieldReportFn({ data: { reportId: params.reportId } });
    if ("error" in report) throw notFound();
    return { report };
  },
  component: ViewFieldReportPage,
});

function ViewFieldReportPage() {
  const { report } = Route.useLoaderData();

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/field" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to reports
        </Link>

        <SectionHeader
          eyebrow={`Week ${report.weekNumber}`}
          title={report.title}
          sub={`${report.farmName} · ${report.cycleTitle}`}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-bone px-3 py-1 text-xs font-medium">
            {STATUS_LABELS[report.status] ?? report.status}
          </span>
          {report.publishedAt && (
            <time className="text-muted-foreground">
              Published {new Date(report.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>

        {report.status === "rejected" && report.rejectionReason && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Rejected: {report.rejectionReason}
          </p>
        )}

        <article className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.body}</p>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {report.mortalityRate != null && (
              <div>
                <dt className="text-muted-foreground">Mortality</dt>
                <dd className="font-semibold text-forest-deep">{report.mortalityRate}%</dd>
              </div>
            )}
            {report.birdCount != null && (
              <div>
                <dt className="text-muted-foreground">Bird count</dt>
                <dd className="font-semibold">{report.birdCount.toLocaleString()}</dd>
              </div>
            )}
            {report.fcr != null && (
              <div>
                <dt className="text-muted-foreground">FCR</dt>
                <dd className="font-semibold">{report.fcr}</dd>
              </div>
            )}
            {report.eggCount != null && (
              <div>
                <dt className="text-muted-foreground">Eggs</dt>
                <dd className="font-semibold">{report.eggCount.toLocaleString()}</dd>
              </div>
            )}
            {report.vaccinationStatus && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Vaccination</dt>
                <dd className="font-semibold">{report.vaccinationStatus}</dd>
              </div>
            )}
          </dl>

          {report.imageUrls.length > 0 && (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {report.imageUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="aspect-video w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </article>

        {(report.status === "draft" || report.status === "rejected") && (
          <Link
            to="/field/reports/$reportId"
            params={{ reportId: report.id }}
            className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Edit report
          </Link>
        )}
      </div>
    </main>
  );
}
