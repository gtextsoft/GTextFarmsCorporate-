import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listAdminTeamFn } from "@/lib/api/admin.site.functions";

type TeamRow = Awaited<ReturnType<typeof listAdminTeamFn>> extends (infer U)[] ? U : never;

export const Route = createFileRoute("/admin/team/")({
  loader: () => listAdminTeamFn(),
  component: AdminTeamPage,
});

function AdminTeamPage() {
  const members = Route.useLoaderData();
  const [selected, setSelected] = useState<TeamRow | null>(null);

  if ("error" in members) {
    return (
      <AdminPage title="Team" description="Manage leadership profiles.">
        <p className="text-muted-foreground">{members.error}</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Team"
      description="Leadership profiles on /about and the landing page."
      stats={[{ label: "Team members", value: members.length }]}
      actions={
        <Button asChild>
          <Link to="/admin/team/new">Add team member</Link>
        </Button>
      }
    >
      <AdminDataTable
        data={members}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No team members yet."
        columns={[
          { id: "name", header: "Name", cell: (m) => m.name },
          {
            id: "role",
            header: "Role",
            hideOnMobile: true,
            cell: (m) => m.role,
            className: "text-muted-foreground",
          },
          {
            id: "published",
            header: "Status",
            cell: (m) => <PublishedBadge published={m.published} />,
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Team member"}
        description={selected?.role}
        footer={
          selected && (
            <Button asChild>
              <Link to="/admin/team/$memberId" params={{ memberId: selected.id }}>
                Edit profile
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
              { label: "Bio", value: selected.bio, fullWidth: true },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
