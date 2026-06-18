import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getMyTransactionsFn } from "@/lib/api/wallet.functions";
import { formatNaira } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  deposit: "Wallet deposit",
  withdrawal: "Withdrawal",
  investment: "Cycle investment",
  return_payout: "Return payout",
  refund: "Refund",
  fee: "Fee",
  adjustment: "Adjustment",
};

export const Route = createFileRoute("/app/reports/")({
  head: () => ({ meta: [{ title: "Activity Reports — GText Farms" }] }),
  loader: () => getMyTransactionsFn(),
  component: ReportsPage,
});

function ReportsPage() {
  const transactions = Route.useLoaderData();

  if ("error" in transactions) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{transactions.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Activity"
          title="Wallet & transaction history."
          sub="Deposits, investments, and payouts recorded against your GText Farms wallet."
        />

        {transactions.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No transactions yet.{" "}
            <Link to="/app/wallet" className="font-medium text-forest-deep hover:underline">
              Fund your wallet
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Balance after</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">{TYPE_LABELS[txn.type] ?? txn.type}</td>
                    <td
                      className={`px-4 py-3 font-medium ${txn.amount >= 0 ? "text-forest-deep" : ""}`}
                    >
                      {txn.amount >= 0 ? "+" : ""}
                      {formatNaira(Math.abs(txn.amount))}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatNaira(txn.balanceAfter)}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{txn.status}</td>
                    <td className="px-4 py-3 text-right">
                      {txn.status === "completed" && (
                        <Link
                          to="/app/reports/$transactionId/receipt"
                          params={{ transactionId: txn.id }}
                          className="font-medium text-forest-deep hover:underline"
                        >
                          Receipt
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
