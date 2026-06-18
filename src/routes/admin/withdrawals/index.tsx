import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  listAdminWithdrawalsFn,
  reviewWithdrawalFn,
} from "@/lib/api/admin.withdrawals.functions";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/admin/withdrawals/")({
  loader: () => listAdminWithdrawalsFn({ data: { status: "pending" } }),
  component: AdminWithdrawalsPage,
});

function AdminWithdrawalsPage() {
  const withdrawals = Route.useLoaderData();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if ("error" in withdrawals) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{withdrawals.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to admin
        </Link>
        <SectionHeader
          eyebrow="Withdrawals"
          title="Payout requests."
          sub="Approve bank transfers after verifying investor details. Funds are locked when a request is submitted."
        />

        {withdrawals.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No pending withdrawal requests.</p>
        ) : (
          <div className="mt-10 space-y-4">
            {withdrawals.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl text-forest-deep">
                      {formatNaira(row.amount)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.investorName} · {row.investorEmail}
                    </p>
                    <p className="mt-2 text-sm">
                      {row.bankName} · {row.accountNumber} · {row.accountName}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{row.reference}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requested {new Date(row.createdAt).toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pendingId === row.id}
                      onClick={async () => {
                        setPendingId(row.id);
                        try {
                          const result = await reviewWithdrawalFn({
                            data: { withdrawalId: row.id, action: "approve" },
                          });
                          if ("error" in result && result.error) {
                            toast.error(result.error);
                          } else {
                            toast.success("Withdrawal approved and wallet debited");
                            window.location.reload();
                          }
                        } catch {
                          toast.error("Could not approve withdrawal");
                        } finally {
                          setPendingId(null);
                        }
                      }}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === row.id}
                      onClick={async () => {
                        const note = window.prompt("Reason for rejection (optional):") ?? "";
                        setPendingId(row.id);
                        try {
                          const result = await reviewWithdrawalFn({
                            data: {
                              withdrawalId: row.id,
                              action: "reject",
                              adminNote: note,
                            },
                          });
                          if ("error" in result && result.error) {
                            toast.error(result.error);
                          } else {
                            toast.success("Withdrawal rejected — funds unlocked");
                            window.location.reload();
                          }
                        } catch {
                          toast.error("Could not reject withdrawal");
                        } finally {
                          setPendingId(null);
                        }
                      }}
                      className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
