import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminInquiriesFn, updateAdminInquiryFn } from "@/lib/api/admin.inquiries.functions";
import { inquiryIntentLabel } from "@/lib/inquiry-intents";

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  intent: string;
  productSlug?: string;
  status: string;
  adminNote?: string;
  createdAt: string;
};

export const Route = createFileRoute("/admin/inquiries/")({
  loader: () => listAdminInquiriesFn(),
  component: AdminInquiriesPage,
});

function AdminInquiriesPage() {
  const inquiries = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState<InquiryRow | null>(null);
  const [pending, setPending] = useState(false);

  if ("error" in inquiries) {
    return (
      <AdminPage title="Contact inquiries" description="Could not load inquiries.">
        <p className="text-muted-foreground">{inquiries.error}</p>
      </AdminPage>
    );
  }

  const newCount = inquiries.filter((i) => i.status === "new").length;

  const stats = useMemo(
    () => [
      { label: "Total", value: inquiries.length },
      { label: "New", value: newCount, highlight: newCount > 0 },
      { label: "Replied", value: inquiries.filter((i) => i.status === "replied").length },
      { label: "Archived", value: inquiries.filter((i) => i.status === "archived").length },
    ],
    [inquiries, newCount],
  );

  return (
    <AdminPage
      title="Contact inquiries"
      description="Messages from the public contact form. New submissions are emailed to sales when Resend is configured."
      stats={stats}
    >
      <AdminDataTable
        data={inquiries as InquiryRow[]}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No inquiries yet."
        caption="Click a row to read the full message and update status."
        columns={[
          {
            id: "from",
            header: "From",
            cell: (inquiry) => (
              <div>
                <div className="font-medium">{inquiry.name}</div>
                <div className="text-xs text-muted-foreground">{inquiry.email}</div>
              </div>
            ),
          },
          { id: "subject", header: "Subject", cell: (inquiry) => inquiry.subject },
          {
            id: "intent",
            header: "Intent",
            hideOnMobile: true,
            cell: (inquiry) => inquiryIntentLabel(inquiry.intent),
            className: "text-muted-foreground",
          },
          {
            id: "status",
            header: "Status",
            cell: (inquiry) => <StatusBadge status={inquiry.status} />,
          },
          {
            id: "received",
            header: "Received",
            hideOnMobile: true,
            cell: (inquiry) => new Date(inquiry.createdAt).toLocaleString(),
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.subject ?? "Inquiry"}
        description={selected ? `${selected.name} · ${selected.email}` : undefined}
        size="lg"
        footer={
          selected && (
            <Button variant="outline" asChild>
              <Link to="/admin/inquiries/$inquiryId" params={{ inquiryId: selected.id }}>
                Open full page
              </Link>
            </Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <DetailFieldGrid
              fields={[
                { label: "Phone", value: selected.phone ?? "—" },
                { label: "Intent", value: inquiryIntentLabel(selected.intent) },
                {
                  label: "Received",
                  value: new Date(selected.createdAt).toLocaleString(),
                },
                { label: "Status", value: <StatusBadge status={selected.status} /> },
              ]}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Message
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
                {selected.message}
              </p>
            </div>
            <form
              className="space-y-3 rounded-lg border border-border p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setPending(true);
                const form = new FormData(e.currentTarget);
                try {
                  const result = await updateAdminInquiryFn({
                    data: {
                      id: selected.id,
                      status: String(form.get("status")) as
                        | "new"
                        | "read"
                        | "replied"
                        | "archived",
                      adminNote: String(form.get("adminNote") || ""),
                    },
                  });
                  if ("error" in result && result.error) toast.error(result.error);
                  else {
                    toast.success("Inquiry updated");
                    setSelected(null);
                    await router.invalidate();
                  }
                } finally {
                  setPending(false);
                }
              }}
            >
              <label className="block text-sm">
                <span className="font-medium">Update status</span>
                <select
                  name="status"
                  defaultValue={selected.status}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Internal note</span>
                <textarea
                  name="adminNote"
                  defaultValue={selected.adminNote ?? ""}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <Button type="submit" disabled={pending} size="sm">
                Save changes
              </Button>
            </form>
          </div>
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
