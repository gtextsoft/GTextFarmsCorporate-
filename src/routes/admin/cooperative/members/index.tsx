import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listCoopMembersFn } from "@/lib/api/coop.functions";
import { MEMBERSHIP_STATUS_LABELS } from "@/lib/coop-membership";
import type { CoopMemberRow, MembershipStatus } from "@/lib/types";

const searchSchema = z.object({
  status: z
    .enum([
      "all",
      "registered",
      "email_verified",
      "provisional_member",
      "full_member",
      "payment_pending",
      "funded",
      "active_investor",
    ])
    .optional(),
});

export const Route = createFileRoute("/admin/cooperative/members/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps }) =>
    listCoopMembersFn({ data: { status: deps.status ?? "all" } }).then((result) => {
      if ("error" in result) return { members: [] as CoopMemberRow[], error: result.error };
      return { members: result, error: null };
    }),
  component: AdminCoopMembersPage,
});

const statusFilters: { label: string; value: MembershipStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Registered", value: "registered" },
  { label: "Profile incomplete", value: "provisional_member" },
  { label: "Full members", value: "full_member" },
  { label: "Payment pending", value: "payment_pending" },
  { label: "Funded", value: "funded" },
];

function AdminCoopMembersPage() {
  const { members, error } = Route.useLoaderData();
  const { status } = Route.useSearch();
  const [selected, setSelected] = useState<CoopMemberRow | null>(null);

  const stats = useMemo(
    () => [
      { label: "Total shown", value: members.length },
      {
        label: "Awaiting profile",
        value: members.filter((m) => m.membershipStatus === "provisional_member").length,
        highlight: true,
      },
      { label: "Full members", value: members.filter((m) => m.membershipStatus === "full_member").length },
      { label: "Email unverified", value: members.filter((m) => m.membershipStatus === "registered").length },
    ],
    [members],
  );

  return (
    <AdminPage
      title="Co-operative members"
      description="Membership registrations, verification status, and profile completion."
      stats={stats}
      actions={
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <Link
              key={f.value}
              to="/admin/cooperative/members"
              search={{ status: f.value === "all" ? undefined : f.value }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                (status ?? "all") === f.value || (!status && f.value === "all")
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      }
    >
      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <AdminDataTable
        rows={members}
        emptyMessage="No co-operative members yet."
        columns={[
          {
            key: "membershipNumber",
            header: "Member #",
            cell: (row) => row.membershipNumber ?? "—",
          },
          {
            key: "fullName",
            header: "Name",
            cell: (row) => row.fullName,
          },
          {
            key: "email",
            header: "Email",
            cell: (row) => row.email,
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <StatusBadge
                status={row.membershipStatus ?? "registered"}
                label={MEMBERSHIP_STATUS_LABELS[row.membershipStatus ?? "registered"]}
              />
            ),
          },
          {
            key: "phone",
            header: "Phone",
            cell: (row) => row.phone ?? "—",
          },
        ]}
        onRowClick={setSelected}
      />

      <RecordDetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.fullName ?? "Member"}
        subtitle={selected?.membershipNumber ? `#${selected.membershipNumber}` : undefined}
      >
        {selected && (
          <DetailFieldGrid
            fields={[
              { label: "Email", value: selected.email },
              { label: "Phone", value: selected.phone ?? "—" },
              { label: "Status", value: MEMBERSHIP_STATUS_LABELS[selected.membershipStatus ?? "registered"] },
              { label: "Email verified", value: selected.emailVerified ? "Yes" : "No" },
              { label: "Nationality", value: selected.nationality ?? "—" },
              { label: "State", value: selected.state ?? "—" },
              { label: "ID type", value: selected.idType ?? "—" },
              { label: "Bank", value: selected.bankName ?? "—" },
              {
                label: "Next of kin",
                value: selected.nextOfKin?.fullName
                  ? `${selected.nextOfKin.fullName} (${selected.nextOfKin.relationship})`
                  : "—",
              },
              { label: "Joined", value: new Date(selected.createdAt).toLocaleDateString() },
            ]}
          />
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
