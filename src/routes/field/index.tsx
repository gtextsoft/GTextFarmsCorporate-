import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  getFieldOfficerStatsFn,
  listMyFieldReportsFn,
} from "@/lib/api/field.reports.functions";

export const Route = createFileRoute("/field/")({
  loader: async () => {
    const [reports, stats] = await Promise.all([
      listMyFieldReportsFn(),
      getFieldOfficerStatsFn(),
    ]);
    return { reports, stats };
  },
  component: FieldHomePage,
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Awaiting review",
  published: "Published",
  rejected: "Needs revision",
};

function FieldHomePage() {
  const { reports, stats } = Route.useLoaderData();

  if ("error" in reports) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{reports.error}</p>
      </main>
    );
  }

  const statCards =
    stats && !("error" in stats)
      ? [
          { label: "Drafts", value: stats.draft },
          { label: "In review", value: stats.submitted },
          { label: "Published", value: stats.published },
          { label: "Needs revision", value: stats.rejected, highlight: stats.rejected > 0 },
        ]
      : [];

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          eyebrow="Field operations"
          title="Weekly farm reports."
          sub="Document bird health, feed, mortality, and production data from the farm. Submit for admin review before investors see it."
        />

        {statCards.length > 0 && (
          <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft"
              >
                <div className="text-xs text-muted-foreground">{card.label}</div>
                <div
                  className={`mt-1 font-display text-2xl ${card.highlight ? "text-destructive" : "text-forest-deep"}`}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/field/reports/new"
          className="mt-8 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create new report
        </Link>

        {reports.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No reports yet.</p>
        ) : (
          <div className="mt-10 space-y-3">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Week {report.weekNumber} · {report.farmName}
                    </p>
                    <h3 className="mt-1 font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.cycleTitle}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      report.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-bone"
                    }`}
                  >
                    {STATUS_LABELS[report.status] ?? report.status}
                  </span>
                </div>

                {report.status === "rejected" && report.rejectionReason && (
                  <p className="mt-3 text-sm text-destructive">{report.rejectionReason}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {report.status === "draft" || report.status === "rejected" ? (
                    <Link
                      to="/field/reports/$reportId"
                      params={{ reportId: report.id }}
                      className="font-medium text-forest-deep hover:underline"
                    >
                      Edit →
                    </Link>
                  ) : (
                    <Link
                      to="/field/reports/$reportId/view"
                      params={{ reportId: report.id }}
                      className="font-medium text-forest-deep hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
