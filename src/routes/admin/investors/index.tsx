import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listInvestorsFn, reviewKycFn } from "@/lib/api/admin.functions";
import type { AdminInvestorRow, KycStatus } from "@/lib/types";

const searchSchema = z.object({
  status: z.enum(["all", "pending", "submitted", "verified", "rejected"]).optional(),
});

export const Route = createFileRoute("/admin/investors/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps }) =>
    listInvestorsFn({ data: { status: deps.status ?? "all" } }).then((result) => {
      if ("error" in result) return { investors: [] as AdminInvestorRow[], error: result.error };
      return { investors: result, error: null };
    }),
  component: AdminInvestorsPage,
});

const statusFilters: { label: string; value: KycStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Awaiting review", value: "submitted" },
  { label: "Not started", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
];

function AdminInvestorsPage() {
  const { investors, error } = Route.useLoaderData();
  const { status } = Route.useSearch();
  const router = useRouter();
  const [selected, setSelected] = useState<AdminInvestorRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const stats = useMemo(
    () => [
      { label: "Total shown", value: investors.length },
      {
        label: "Awaiting review",
        value: investors.filter((i) => i.kycStatus === "submitted").length,
        highlight: true,
      },
      { label: "Verified", value: investors.filter((i) => i.kycStatus === "verified").length },
      { label: "Rejected", value: investors.filter((i) => i.kycStatus === "rejected").length },
    ],
    [investors],
  );

  async function handleReview(userId: string, action: "approve" | "reject", reason?: string) {
    setPendingId(userId);
    try {
      const result = await reviewKycFn({ data: { userId, action, reason } });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(action === "approve" ? "KYC approved" : "KYC rejected");
        setSelected(null);
        setRejectReason("");
        await router.invalidate();
      }
    } catch {
      toast.error("Action failed. Check MongoDB connection.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminPage
      title="Investors"
      description="Review KYC submissions and manage investor accounts."
      stats={stats}
      actions={
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <Link
              key={f.value}
              to="/admin/investors"
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
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error === "Forbidden"
            ? "You do not have admin access."
            : "Could not load investors. Sign in as admin and ensure MongoDB is running."}
        </p>
      )}

      <AdminDataTable
        data={investors}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No investors match this filter."
        caption="Click a row to view details and take KYC action."
        columns={[
          {
            id: "investor",
            header: "Investor",
            cell: (inv) => (
              <div>
                <div className="font-medium">{inv.fullName}</div>
                <div className="text-xs text-muted-foreground">{inv.email}</div>
              </div>
            ),
          },
          {
            id: "location",
            header: "Location",
            hideOnMobile: true,
            cell: (inv) =>
              inv.city && inv.state ? `${inv.city}, ${inv.state}` : "—",
            className: "text-muted-foreground",
          },
          {
            id: "kyc",
            header: "KYC status",
            cell: (inv) => <StatusBadge status={inv.kycStatus} />,
          },
          {
            id: "joined",
            header: "Joined",
            hideOnMobile: true,
            cell: (inv) => new Date(inv.createdAt).toLocaleDateString(),
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.fullName ?? "Investor"}
        description={selected?.email}
        size="lg"
        footer={
          selected && (
            <>
              <Button variant="outline" asChild>
                <Link to="/admin/investors/$investorId" params={{ investorId: selected.id }}>
                  Full profile
                </Link>
              </Button>
              {selected.kycStatus === "submitted" && (
                <>
                  <Button
                    variant="outline"
                    disabled={pendingId === selected.id}
                    onClick={() => handleReview(selected.id, "reject", rejectReason)}
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={pendingId === selected.id}
                    onClick={() => handleReview(selected.id, "approve")}
                  >
                    Approve KYC
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <DetailFieldGrid
              fields={[
                { label: "Phone", value: selected.phone ?? "—" },
                {
                  label: "Location",
                  value:
                    selected.city && selected.state
                      ? `${selected.city}, ${selected.state}`
                      : "—",
                },
                { label: "KYC status", value: <StatusBadge status={selected.kycStatus} /> },
                {
                  label: "Joined",
                  value: new Date(selected.createdAt).toLocaleString(),
                },
              ]}
            />
            {selected.kycRejectionReason && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                Previous rejection: {selected.kycRejectionReason}
              </div>
            )}
            {selected.kycStatus === "submitted" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rejection reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Shown to investor if you reject"
                />
              </div>
            )}
          </div>
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
