import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminGalleryFn } from "@/lib/api/admin.catalog.functions";

type GalleryRow = Awaited<ReturnType<typeof listAdminGalleryFn>> extends (infer U)[]
  ? U
  : never;

export const Route = createFileRoute("/admin/gallery/")({
  loader: () => listAdminGalleryFn(),
  component: AdminGalleryPage,
});

function AdminGalleryPage() {
  const items = Route.useLoaderData();
  const [selected, setSelected] = useState<GalleryRow | null>(null);

  if ("error" in items) {
    return (
      <AdminPage title="Gallery" description="Manage gallery photos.">
        <p className="text-muted-foreground">{items.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Gallery"
      description="Manage photos shown on /gallery and the home page preview."
      stats={[
        { label: "Total items", value: items.length },
        { label: "Published", value: items.filter((i) => i.published).length },
      ]}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/gallery">View public page</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/gallery/new">Add photo</Link>
          </Button>
        </>
      }
    >
      <AdminDataTable
        data={items}
        getRowKey={(row) => row.slug}
        onRowClick={setSelected}
        emptyMessage="No gallery items yet."
        columns={[
          { id: "title", header: "Title", cell: (item) => item.title },
          {
            id: "category",
            header: "Category",
            hideOnMobile: true,
            cell: (item) => item.categoryLabel,
            className: "text-muted-foreground",
          },
          { id: "sort", header: "Sort", cell: (item) => item.sortOrder },
          {
            id: "published",
            header: "Status",
            cell: (item) => <PublishedBadge published={item.published} />,
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "Gallery item"}
        description={selected?.categoryLabel}
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/gallery/$itemSlug" params={{ itemSlug: selected.slug }}>
                Edit item
              </Link>
            </Button>
          )
        }
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              { label: "Slug", value: selected.slug },
              { label: "Sort order", value: selected.sortOrder },
              {
                label: "Status",
                value: <PublishedBadge published={selected.published} />,
              },
              { label: "Category", value: selected.categoryLabel, fullWidth: true },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
