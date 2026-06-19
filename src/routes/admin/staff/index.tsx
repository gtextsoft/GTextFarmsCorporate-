import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { listStaffFn } from "@/lib/api/admin.staff.functions";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  field_officer: "Field officer",
};

type StaffRow = Awaited<ReturnType<typeof listStaffFn>> extends (infer U)[] ? U : never;

export const Route = createFileRoute("/admin/staff/")({
  loader: () => listStaffFn(),
  component: AdminStaffPage,
});

function AdminStaffPage() {
  const staff = Route.useLoaderData();
  const [selected, setSelected] = useState<StaffRow | null>(null);

  if ("error" in staff) {
    return (
      <AdminPage title="Staff" description="Portal user accounts.">
        <p className="text-muted-foreground">{staff.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Staff accounts"
      description="Admins and field officers with portal access. Create accounts via CLI scripts."
      stats={[
        { label: "Total staff", value: staff.length },
        {
          label: "Field officers",
          value: staff.filter((m) => m.role === "field_officer").length,
        },
      ]}
      actions={
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <code>npm run db:create-admin</code> · <code>npm run db:create-field-officer</code>
        </div>
      }
    >
      <AdminDataTable
        data={staff}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No staff accounts yet."
        caption="Click a row to view staff details."
        columns={[
          {
            id: "name",
            header: "Name",
            cell: (member) => (
              <div>
                <div className="font-medium">{member.fullName}</div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
              </div>
            ),
          },
          {
            id: "role",
            header: "Role",
            cell: (member) => ROLE_LABELS[member.role] ?? member.role,
          },
          {
            id: "phone",
            header: "Phone",
            hideOnMobile: true,
            cell: (member) => member.phone ?? "—",
            className: "text-muted-foreground",
          },
          {
            id: "joined",
            header: "Joined",
            hideOnMobile: true,
            cell: (member) =>
              member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "—",
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.fullName ?? "Staff member"}
        description={selected?.email}
        footer={
          selected?.role === "field_officer" ? (
            <Button variant="outline" asChild>
              <Link to="/field">Open field portal</Link>
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              { label: "Role", value: ROLE_LABELS[selected.role] ?? selected.role },
              { label: "Phone", value: selected.phone ?? "—" },
              {
                label: "Joined",
                value: selected.createdAt
                  ? new Date(selected.createdAt).toLocaleString()
                  : "—",
              },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
