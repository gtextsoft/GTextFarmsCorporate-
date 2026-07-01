import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { DetailFieldGrid, RecordDetailDialog } from "@/components/admin/RecordDetailDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { listCoopPaymentsFn, reviewCoopPaymentFn } from "@/lib/api/coop-payments.functions";
import { formatNaira } from "@/lib/format";
import type { CoopPaymentRow } from "@/lib/types";

const searchSchema = z.object({
  status: z.enum(["all", "pending", "approved", "rejected"]).optional(),
});

export const Route = createFileRoute("/admin/cooperative/payments/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps }) =>
    listCoopPaymentsFn({ data: { status: deps.status ?? "pending" } }).then((result) => {
      if ("error" in result) return { payments: [] as CoopPaymentRow[], error: result.error };
      return { payments: result, error: null };
    }),
  component: AdminCoopPaymentsPage,
});

const PURPOSE_LABEL = {
  entrance_fee: "Entrance fee",
  investment_deposit: "Investment funding",
} as const;

const statusFilters = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
] as const;

function AdminCoopPaymentsPage() {
  const { payments, error } = Route.useLoaderData();
  const { status } = Route.useSearch();
  const router = useRouter();
  const [selected, setSelected] = useState<CoopPaymentRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [verifiedAmount, setVerifiedAmount] = useState("");

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  function openPayment(row: CoopPaymentRow) {
    setSelected(row);
    setVerifiedAmount(String(row.amount));
  }

  async function handleReview(paymentId: string, action: "approve" | "reject") {
    let approvedAmount: number | undefined;
    if (action === "approve" && selected?.purpose === "investment_deposit") {
      approvedAmount = Number(verifiedAmount);
      if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
        toast.error("Enter a valid amount to credit.");
        return;
      }
    }

    setPendingId(paymentId);
    try {
      const result = await reviewCoopPaymentFn({
        data: {
          paymentId,
          action,
          rejectionReason: action === "reject" ? rejectReason : undefined,
          approvedAmount,
        },
      });
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success(action === "approve" ? "Payment approved" : "Payment rejected");
        setSelected(null);
        setRejectReason("");
        await router.invalidate();
      }
    } catch {
      toast.error("Could not process payment");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminPage
      title="Co-operative payments"
      description="Confirm manual bank-transfer payments. Approving an entrance fee makes a member; approving a deposit credits their investment balance."
      stats={[
        { label: "Shown", value: payments.length },
        { label: "Pending amount", value: formatNaira(totalPending), highlight: totalPending > 0 },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <Link
              key={f.value}
              to="/admin/cooperative/payments"
              search={{ status: f.value === "pending" ? undefined : f.value }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                (status ?? "pending") === f.value
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
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <AdminDataTable
        data={payments}
        getRowKey={(row) => row.id}
        onRowClick={openPayment}
        emptyMessage="No payments to review."
        caption="Click a row to view the receipt and approve or reject."
        columns={[
          {
            id: "member",
            header: "Member",
            cell: (row) => (
              <div>
                <div className="font-medium">{row.memberName ?? "—"}</div>
                <div className="text-xs text-muted-foreground">
                  {row.membershipNumber ? `#${row.membershipNumber}` : row.memberEmail}
                </div>
              </div>
            ),
          },
          {
            id: "purpose",
            header: "For",
            hideOnMobile: true,
            cell: (row) => PURPOSE_LABEL[row.purpose],
          },
          {
            id: "amount",
            header: "Amount",
            cell: (row) => (
              <span className="font-semibold text-forest-deep">{formatNaira(row.amount)}</span>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            id: "submitted",
            header: "Submitted",
            hideOnMobile: true,
            cell: (row) => new Date(row.createdAt).toLocaleString(),
            className: "text-muted-foreground",
          },
        ]}
      />

      <RecordDetailDialog
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected ? formatNaira(selected.amount) : "Payment"}
        description={
          selected
            ? `${selected.memberName ?? "Member"} · ${PURPOSE_LABEL[selected.purpose]}`
            : undefined
        }
        size="lg"
        footer={
          selected?.status === "pending" && (
            <>
              <Button
                variant="outline"
                disabled={pendingId === selected.id}
                onClick={() => handleReview(selected.id, "reject")}
              >
                Reject
              </Button>
              <Button
                disabled={pendingId === selected.id}
                onClick={() => handleReview(selected.id, "approve")}
              >
                Approve payment
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <DetailFieldGrid
              fields={[
                { label: "Member email", value: selected.memberEmail ?? "—" },
                { label: "Membership #", value: selected.membershipNumber ?? "—" },
                { label: "Payer account name", value: selected.payerAccountName },
                { label: "Payer bank", value: selected.payerBankName },
                { label: "Amount paid", value: formatNaira(selected.amount) },
                {
                  label: "Transfer date",
                  value: selected.transferDate
                    ? new Date(selected.transferDate).toLocaleDateString()
                    : "—",
                },
                { label: "Transfer reference", value: selected.transferReference ?? "—" },
                { label: "Status", value: <StatusBadge status={selected.status} /> },
                {
                  label: "Receipt",
                  fullWidth: true,
                  value: (
                    <a
                      href={selected.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-forest-deep underline"
                    >
                      View uploaded receipt
                    </a>
                  ),
                },
                ...(selected.rejectionReason
                  ? [
                      {
                        label: "Rejection reason",
                        value: selected.rejectionReason,
                        fullWidth: true,
                      },
                    ]
                  : []),
              ]}
            />
            {selected.status === "pending" && selected.purpose === "investment_deposit" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Verified amount to credit (₦)
                </label>
                <input
                  type="number"
                  min={1}
                  value={verifiedAmount}
                  onChange={(e) => setVerifiedAmount(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Member entered {formatNaira(selected.amount)}. Confirm the real amount against the
                  receipt before approving — this is what gets credited.
                </p>
              </div>
            )}
            {selected.status === "pending" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rejection reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Shown to the member if rejected"
                />
              </div>
            )}
          </div>
        )}
      </RecordDetailDialog>
    </AdminPage>
  );
}
