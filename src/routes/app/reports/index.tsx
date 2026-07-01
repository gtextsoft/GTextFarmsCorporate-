import { Link, createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { InvestorTransactionsDashboard } from "@/components/app/InvestorTransactionsDashboard";
import { Button } from "@/components/ui/button";
import { getMyTransactionsFn } from "@/lib/api/wallet.functions";

export const Route = createFileRoute("/app/reports/")({
  head: () => ({ meta: [{ title: "Transactions — GText Farms" }] }),
  loader: () => getMyTransactionsFn(),
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = Route.useLoaderData();

  if ("error" in transactions) {
    return (
      <main className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{transactions.error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest">
              Activity
            </p>
            <h1 className="mt-2 font-display text-3xl text-forest-deep md:text-4xl">
              Transactions
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Full history of deposits, investments, withdrawals, and return payouts on your GText
              Farms wallet.
            </p>
          </div>
          {transactions.length > 0 && (
            <Button asChild variant="outline" className="shrink-0 rounded-xl">
              <Link to="/app/wallet">
                <Wallet className="size-4" />
                Wallet
              </Link>
            </Button>
          )}
        </div>

        <InvestorTransactionsDashboard transactions={transactions} />
      </div>
    </main>
  );
}
