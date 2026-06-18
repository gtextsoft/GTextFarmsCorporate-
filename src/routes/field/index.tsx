import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listMyFieldReportsFn } from "@/lib/api/field.reports.functions";

export const Route = createFileRoute("/field/")({
  loader: () => listMyFieldReportsFn(),
  component: FieldHomePage,
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Awaiting review",
  published: "Published",
  rejected: "Needs revision",
};

function FieldHomePage() {
  const reports = Route.useLoaderData();

  if ("error" in reports) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{reports.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          eyebrow="Field operations"
          title="Weekly farm reports."
          sub="Document bird health, feed, mortality, and production data from the farm. Submit for admin review before investors see it."
        />

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
                  <span className="rounded-full bg-bone px-3 py-1 text-xs font-medium">
                    {STATUS_LABELS[report.status] ?? report.status}
                  </span>
                </div>
                {(report.status === "draft" || report.status === "rejected") && (
                  <Link
                    to="/field/reports/$reportId"
                    params={{ reportId: report.id }}
                    className="mt-4 inline-flex text-sm font-medium text-forest-deep hover:underline"
                  >
                    Edit report →
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
