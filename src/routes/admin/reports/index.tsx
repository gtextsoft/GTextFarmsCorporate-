import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  listAdminFieldReportsFn,
  reviewFieldReportFn,
} from "@/lib/api/admin.reports.functions";

type FieldReportRow = Awaited<ReturnType<typeof listAdminFieldReportsFn>> extends (infer U)[]
  ? U
  : never;

export const Route = createFileRoute("/admin/reports/")({
  loader: () => listAdminFieldReportsFn({ data: { status: "submitted" } }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const reports = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState<FieldReportRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if ("error" in reports) {
    return (
      <AdminPage title="Field reports" description="Weekly updates from field officers.">
        <p className="text-muted-foreground">{reports.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Field reports"
      description="Publish verified weekly updates to investor dashboards and opportunity pages."
      stats={[
        { label: "Awaiting review", value: reports.length, highlight: reports.length > 0 },
      ]}
    >
      <AdminDataTable
        data={reports}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No reports awaiting review."
        caption="Click a row to read the full report and publish or reject."
        columns={[
          {
            id: "title",
            header: "Report",
            cell: (report) => (
              <div>
                <div className="font-medium">{report.title}</div>
                <div className="text-xs text-muted-foreground">
                  Week {report.weekNumber} · {report.authorName}
                </div>
              </div>
            ),
          },
          {
            id: "farm",
            header: "Farm / cycle",
            hideOnMobile: true,
            cell: (report) => `${report.farmName} · ${report.cycleTitle}`,
            className: "text-muted-foreground",
          },
          {
            id: "birds",
            header: "Birds",
            hideOnMobile: true,
            cell: (report) => (report.birdCount != null ? report.birdCount.toLocaleString() : "—"),
          },
          {
            id: "status",
            header: "Status",
            cell: (report) => <StatusBadge status={report.status} />,
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "Field report"}
        description={
          selected ? `${selected.farmName} · ${selected.cycleTitle}` : undefined
        }
        size="xl"
        footer={
          selected && (
            <>
              <Button
                variant="outline"
                disabled={pendingId === selected.id}
                onClick={async () => {
                  setPendingId(selected.id);
                  try {
                    const result = await reviewFieldReportFn({
                      data: {
                        reportId: selected.id,
                        action: "reject",
                        rejectionReason: rejectReason,
                      },
                    });
                    if ("error" in result && result.error) toast.error(result.error);
                    else {
                      toast.success("Report sent back to field officer");
                      setSelected(null);
                      await router.invalidate();
                    }
                  } catch {
                    toast.error("Could not reject report");
                  } finally {
                    setPendingId(null);
                  }
                }}
              >
                Reject
              </Button>
              <Button
                disabled={pendingId === selected.id}
                onClick={async () => {
                  setPendingId(selected.id);
                  try {
                    const result = await reviewFieldReportFn({
                      data: { reportId: selected.id, action: "publish" },
                    });
                    if ("error" in result && result.error) toast.error(result.error);
                    else {
                      toast.success("Report published to investors");
                      setSelected(null);
                      await router.invalidate();
                    }
                  } catch {
                    toast.error("Could not publish report");
                  } finally {
                    setPendingId(null);
                  }
                }}
              >
                Publish
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <DetailFieldGrid
              fields={[
                { label: "Author", value: selected.authorName },
                { label: "Week", value: selected.weekNumber },
                {
                  label: "Mortality",
                  value: selected.mortalityRate != null ? `${selected.mortalityRate}%` : "—",
                },
                {
                  label: "Bird count",
                  value:
                    selected.birdCount != null ? selected.birdCount.toLocaleString() : "—",
                },
                { label: "FCR", value: selected.fcr ?? "—" },
                {
                  label: "Vaccination",
                  value: selected.vaccinationStatus ?? "—",
                  fullWidth: true,
                },
              ]}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Report body
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
                {selected.body}
              </p>
            </div>
            {selected.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.imageUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-forest-deep hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View photo
                  </a>
                ))}
              </div>
            )}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rejection reason (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
