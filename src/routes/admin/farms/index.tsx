import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminFarmsFn } from "@/lib/api/admin.content.functions";

type FarmRow = Awaited<ReturnType<typeof listAdminFarmsFn>> extends (infer U)[]
  ? U
  : never;

export const Route = createFileRoute("/admin/farms/")({
  loader: () => listAdminFarmsFn(),
  component: AdminFarmsPage,
});

function AdminFarmsPage() {
  const farms = Route.useLoaderData();
  const [selected, setSelected] = useState<FarmRow | null>(null);

  if ("error" in farms) {
    return (
      <AdminPage title="Farms" description="Manage published farms.">
        <p className="text-muted-foreground">{farms.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Farms"
      description="Manage published farms and operational stats shown on the public site."
      stats={[
        { label: "Total farms", value: farms.length },
        {
          label: "Published",
          value: farms.filter((f) => f.published !== false).length,
        },
      ]}
      actions={
        <Button asChild>
          <Link to="/admin/farms/new">Add farm</Link>
        </Button>
      }
    >
      <AdminDataTable
        data={farms}
        getRowKey={(row) => row.slug}
        onRowClick={setSelected}
        emptyMessage="No farms yet."
        caption="Click a row to preview details."
        columns={[
          { id: "name", header: "Farm", cell: (farm) => farm.name },
          {
            id: "location",
            header: "Location",
            hideOnMobile: true,
            cell: (farm) => `${farm.location}, ${farm.state}`,
            className: "text-muted-foreground",
          },
          {
            id: "birds",
            header: "Birds",
            cell: (farm) => farm.birdCount,
          },
          {
            id: "published",
            header: "Status",
            cell: (farm) => <PublishedBadge published={farm.published !== false} />,
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Farm"}
        description={selected ? `${selected.location}, ${selected.state}` : undefined}
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/farms/$farmSlug" params={{ farmSlug: selected.slug }}>
                Edit farm
              </Link>
            </Button>
          )
        }
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              { label: "Slug", value: selected.slug },
              { label: "Bird count", value: selected.birdCount },
              {
                label: "Status",
                value: <PublishedBadge published={selected.published !== false} />,
              },
              { label: "Description", value: selected.description, fullWidth: true },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
