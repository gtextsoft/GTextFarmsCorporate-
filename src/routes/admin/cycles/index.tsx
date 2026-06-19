import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge, StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminCyclesFn } from "@/lib/api/admin.content.functions";

type CycleRow = Awaited<ReturnType<typeof listAdminCyclesFn>> extends (infer U)[]
  ? U
  : never;

export const Route = createFileRoute("/admin/cycles/")({
  loader: () => listAdminCyclesFn(),
  component: AdminCyclesPage,
});

function AdminCyclesPage() {
  const cycles = Route.useLoaderData();
  const [selected, setSelected] = useState<CycleRow | null>(null);

  if ("error" in cycles) {
    return (
      <AdminPage title="Cycles" description="Manage investment cycles.">
        <p className="text-muted-foreground">{cycles.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Investment cycles"
      description="Manage funding targets, status, and publish state for investment opportunities."
      stats={[
        { label: "Total cycles", value: cycles.length },
        {
          label: "Open / funding",
          value: cycles.filter((c) => c.status === "funding" || c.status === "active").length,
        },
      ]}
      actions={
        <Button asChild>
          <Link to="/admin/cycles/new">Add cycle</Link>
        </Button>
      }
    >
      <AdminDataTable
        data={cycles}
        getRowKey={(row) => row.slug}
        onRowClick={setSelected}
        emptyMessage="No cycles yet."
        caption="Click a row to preview cycle details."
        columns={[
          { id: "title", header: "Cycle", cell: (cycle) => cycle.title },
          {
            id: "farm",
            header: "Farm",
            hideOnMobile: true,
            cell: (cycle) => cycle.farmName,
            className: "text-muted-foreground",
          },
          {
            id: "status",
            header: "Status",
            cell: (cycle) => <StatusBadge status={cycle.status} />,
          },
          { id: "funded", header: "Funded", cell: (cycle) => `${cycle.filled}%` },
          {
            id: "published",
            header: "Live",
            cell: (cycle) => <PublishedBadge published={cycle.published !== false} />,
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "Cycle"}
        description={selected?.farmName}
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/cycles/$cycleSlug" params={{ cycleSlug: selected.slug }}>
                Edit cycle
              </Link>
            </Button>
          )
        }
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              { label: "Slug", value: selected.slug },
              { label: "Status", value: <StatusBadge status={selected.status} /> },
              { label: "Funded", value: `${selected.filled}%` },
              {
                label: "Published",
                value: <PublishedBadge published={selected.published !== false} />,
              },
              { label: "Target", value: selected.target, fullWidth: true },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
