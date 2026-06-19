import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminProductsFn } from "@/lib/api/admin.catalog.functions";

type ProductRow = Awaited<ReturnType<typeof listAdminProductsFn>> extends (infer U)[]
  ? U
  : never;

export const Route = createFileRoute("/admin/products/")({
  loader: () => listAdminProductsFn(),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const products = Route.useLoaderData();
  const [selected, setSelected] = useState<ProductRow | null>(null);

  if ("error" in products) {
    return (
      <AdminPage title="Products" description="Manage the products catalogue.">
        <p className="text-muted-foreground">{products.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Products"
      description="Manage the public products catalogue — poultry, vegetables, and processed goods."
      stats={[
        { label: "Total products", value: products.length },
        { label: "Published", value: products.filter((p) => p.published).length },
      ]}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/products">View public page</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/products/new">Add product</Link>
          </Button>
        </>
      }
    >
      <AdminDataTable
        data={products}
        getRowKey={(row) => row.slug}
        onRowClick={setSelected}
        emptyMessage="No products yet. Run npm run db:seed or add one."
        columns={[
          { id: "name", header: "Product", cell: (p) => p.name },
          {
            id: "category",
            header: "Category",
            hideOnMobile: true,
            cell: (p) => p.categoryLabel,
            className: "text-muted-foreground",
          },
          { id: "sort", header: "Sort", cell: (p) => p.sortOrder },
          {
            id: "published",
            header: "Status",
            cell: (p) => <PublishedBadge published={p.published} />,
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Product"}
        description={selected?.categoryLabel}
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/products/$productSlug" params={{ productSlug: selected.slug }}>
                Edit product
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
