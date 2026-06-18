import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  listAdminFieldReportsFn,
  reviewFieldReportFn,
} from "@/lib/api/admin.reports.functions";

export const Route = createFileRoute("/admin/reports/")({
  loader: () => listAdminFieldReportsFn({ data: { status: "submitted" } }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const reports = Route.useLoaderData();
  const [pendingId, setPendingId] = useState<string | null>(null);

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
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to admin
        </Link>
        <SectionHeader
          eyebrow="Field reports"
          title="Review queue."
          sub="Publish verified weekly updates to investor dashboards and opportunity pages."
        />

        {reports.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No reports awaiting review.</p>
        ) : (
          <div className="mt-10 space-y-6">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Week {report.weekNumber} · {report.authorName}
                    </p>
                    <h3 className="mt-1 font-display text-xl">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.farmName} · {report.cycleTitle}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{report.body}</p>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {report.mortalityRate != null && (
                    <div>
                      <dt className="text-muted-foreground">Mortality</dt>
                      <dd className="font-medium">{report.mortalityRate}%</dd>
                    </div>
                  )}
                  {report.birdCount != null && (
                    <div>
                      <dt className="text-muted-foreground">Bird count</dt>
                      <dd className="font-medium">{report.birdCount.toLocaleString()}</dd>
                    </div>
                  )}
                  {report.fcr != null && (
                    <div>
                      <dt className="text-muted-foreground">FCR</dt>
                      <dd className="font-medium">{report.fcr}</dd>
                    </div>
                  )}
                  {report.vaccinationStatus && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Vaccination</dt>
                      <dd className="font-medium">{report.vaccinationStatus}</dd>
                    </div>
                  )}
                </dl>

                {report.imageUrls.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.imageUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-forest-deep hover:underline"
                      >
                        View photo
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pendingId === report.id}
                    onClick={async () => {
                      setPendingId(report.id);
                      try {
                        const result = await reviewFieldReportFn({
                          data: { reportId: report.id, action: "publish" },
                        });
                        if ("error" in result && result.error) toast.error(result.error);
                        else {
                          toast.success("Report published to investors");
                          window.location.reload();
                        }
                      } catch {
                        toast.error("Could not publish report");
                      } finally {
                        setPendingId(null);
                      }
                    }}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === report.id}
                    onClick={async () => {
                      const reason = window.prompt("Reason for rejection (optional):") ?? "";
                      setPendingId(report.id);
                      try {
                        const result = await reviewFieldReportFn({
                          data: {
                            reportId: report.id,
                            action: "reject",
                            rejectionReason: reason,
                          },
                        });
                        if ("error" in result && result.error) toast.error(result.error);
                        else {
                          toast.success("Report sent back to field officer");
                          window.location.reload();
                        }
                      } catch {
                        toast.error("Could not reject report");
                      } finally {
                        setPendingId(null);
                      }
                    }}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
