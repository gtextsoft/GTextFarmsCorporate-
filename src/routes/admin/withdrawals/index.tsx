import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  listAdminWithdrawalsFn,
  reviewWithdrawalFn,
} from "@/lib/api/admin.withdrawals.functions";
import { formatNaira } from "@/lib/format";

type WithdrawalRow = {
  id: string;
  amount: number;
  status: string;
  reference: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  adminNote?: string;
  investorName: string;
  investorEmail: string;
  createdAt: string;
  processedAt?: string;
};

export const Route = createFileRoute("/admin/withdrawals/")({
  loader: () => listAdminWithdrawalsFn({ data: { status: "pending" } }),
  component: AdminWithdrawalsPage,
});

function AdminWithdrawalsPage() {
  const withdrawals = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState<WithdrawalRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  if ("error" in withdrawals) {
    return (
      <AdminPage title="Withdrawals" description="Payout requests from investors.">
        <p className="text-muted-foreground">{withdrawals.error}</p>
      </AdminPage>
    );
  }

  const rows = withdrawals as WithdrawalRow[];
  const totalPending = rows.reduce((sum, row) => sum + row.amount, 0);

  async function handleReview(
    withdrawalId: string,
    action: "approve" | "reject",
    adminNote?: string,
  ) {
    setPendingId(withdrawalId);
    try {
      const result = await reviewWithdrawalFn({
        data: { withdrawalId, action, adminNote },
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          action === "approve" ? "Withdrawal approved" : "Withdrawal rejected — funds unlocked",
        );
        setSelected(null);
        setRejectNote("");
        await router.invalidate();
      }
    } catch {
      toast.error("Could not process withdrawal");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminPage
      title="Withdrawals"
      description="Approve bank transfers after verifying investor details. Funds are locked when a request is submitted."
      stats={[
        { label: "Pending requests", value: rows.length, highlight: rows.length > 0 },
        { label: "Total pending amount", value: formatNaira(totalPending) },
      ]}
    >
      <AdminDataTable
        data={rows}
        getRowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyMessage="No pending withdrawal requests."
        caption="Click a row to review bank details and approve or reject."
        columns={[
          {
            id: "investor",
            header: "Investor",
            cell: (row) => (
              <div>
                <div className="font-medium">{row.investorName}</div>
                <div className="text-xs text-muted-foreground">{row.investorEmail}</div>
              </div>
            ),
          },
          {
            id: "amount",
            header: "Amount",
            cell: (row) => (
              <span className="font-semibold text-forest-deep">{formatNaira(row.amount)}</span>
            ),
          },
          {
            id: "bank",
            header: "Bank",
            hideOnMobile: true,
            cell: (row) => row.bankName,
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            id: "requested",
            header: "Requested",
            hideOnMobile: true,
            cell: (row) => new Date(row.createdAt).toLocaleString(),
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected ? formatNaira(selected.amount) : "Withdrawal"}
        description={selected ? `${selected.investorName} · ${selected.reference}` : undefined}
        size="lg"
        footer={
          selected && (
            <>
              <Button
                variant="outline"
                disabled={pendingId === selected.id}
                onClick={() => handleReview(selected.id, "reject", rejectNote)}
              >
                Reject
              </Button>
              <Button
                disabled={pendingId === selected.id}
                onClick={() => handleReview(selected.id, "approve")}
              >
                Approve payout
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <DetailFieldGrid
              fields={[
                { label: "Investor email", value: selected.investorEmail },
                { label: "Bank", value: selected.bankName },
                { label: "Account number", value: selected.accountNumber },
                { label: "Account name", value: selected.accountName },
                { label: "Reference", value: selected.reference, fullWidth: true },
                {
                  label: "Requested",
                  value: new Date(selected.createdAt).toLocaleString(),
                },
                { label: "Status", value: <StatusBadge status={selected.status} /> },
              ]}
            />
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rejection note (optional)
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Shown to investor if rejected"
              />
            </div>
          </div>
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
