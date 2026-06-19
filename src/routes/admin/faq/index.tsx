import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminFaqFn } from "@/lib/api/admin.site.functions";

type FaqRow = Awaited<ReturnType<typeof listAdminFaqFn>> extends (infer U)[] ? U : never;

export const Route = createFileRoute("/admin/faq/")({
  loader: () => listAdminFaqFn(),
  component: AdminFaqPage,
});

function AdminFaqPage() {
  const items = Route.useLoaderData();
  const [selected, setSelected] = useState<FaqRow | null>(null);

  if ("error" in items) {
    return (
      <AdminPage title="FAQ" description="Manage frequently asked questions.">
        <p className="text-muted-foreground">{items.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="FAQ"
      description="Questions shown on the landing page and /about."
      stats={[
        { label: "Total items", value: items.length },
        { label: "Published", value: items.filter((i) => i.published).length },
      ]}
      actions={
        <Button asChild>
          <Link to="/admin/faq/new">Add FAQ item</Link>
        </Button>
      }
    >
      <AdminDataTable
        data={items}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No FAQ items yet."
        columns={[
          { id: "question", header: "Question", cell: (item) => item.question },
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
        title="FAQ item"
        description={selected?.question}
        size="lg"
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/faq/$faqId" params={{ faqId: selected.id }}>
                Edit FAQ
              </Link>
            </Button>
          )
        }
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              {
                label: "Status",
                value: <PublishedBadge published={selected.published} />,
              },
              { label: "Answer", value: selected.answer, fullWidth: true },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
