import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { listAdminAuditLogsFn } from "@/lib/api/admin.audit.functions";

type AuditRow = Awaited<ReturnType<typeof listAdminAuditLogsFn>> extends (infer U)[]
  ? U
  : never;

export const Route = createFileRoute("/admin/audit/")({
  loader: () => listAdminAuditLogsFn({ data: { limit: 200 } }),
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const logs = Route.useLoaderData();
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  if ("error" in logs) {
    return (
      <AdminPage title="Audit log" description="Platform activity history.">
        <p className="text-muted-foreground">{logs.error}</p>
      </AdminPage>
    );
  }

  const actions = useMemo(() => [...new Set(logs.map((l) => l.action))].sort(), [logs]);
  const entityTypes = useMemo(() => [...new Set(logs.map((l) => l.entityType))].sort(), [logs]);

  const filtered = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (entityFilter && log.entityType !== entityFilter) return false;
    return true;
  });

  return (
    <AdminPage
      title="Audit log"
      description="Financial, KYC, withdrawal, and compliance actions taken by admins and the system."
      stats={[
        { label: "Entries shown", value: filtered.length },
        { label: "Action types", value: actions.length },
        { label: "Entity types", value: entityTypes.length },
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/analytics"
            className="text-sm font-medium text-forest-deep hover:underline"
          >
            Analytics overview
          </Link>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="">All entities</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <AdminDataTable
        data={filtered}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No audit entries match your filters."
        caption="Click a row to view full audit details."
        columns={[
          {
            id: "action",
            header: "Action",
            cell: (log) => <span className="font-medium">{log.action}</span>,
          },
          {
            id: "entity",
            header: "Entity",
            hideOnMobile: true,
            cell: (log) => (
              <span className="text-muted-foreground">
                {log.entityType}
                {log.entityId ? ` · …${log.entityId.slice(-8)}` : ""}
              </span>
            ),
          },
          {
            id: "actor",
            header: "Actor",
            hideOnMobile: true,
            cell: (log) => log.actorEmail ?? "System",
            className: "text-muted-foreground",
          },
          {
            id: "time",
            header: "When",
            cell: (log) => new Date(log.createdAt).toLocaleString(),
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.action ?? "Audit entry"}
        description={
          selected
            ? `${selected.entityType}${selected.entityId ? ` · ${selected.entityId}` : ""}`
            : undefined
        }
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <DetailFieldGrid
              fields={[
                { label: "Actor", value: selected.actorEmail ?? "System" },
                {
                  label: "Timestamp",
                  value: new Date(selected.createdAt).toLocaleString(),
                },
                { label: "Entity ID", value: selected.entityId ?? "—", fullWidth: true },
              ]}
            />
            {selected.details && Object.keys(selected.details).length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Details
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs">
                  {JSON.stringify(selected.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
