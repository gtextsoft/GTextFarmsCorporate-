import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { InvestorWalletDashboard } from "@/components/app/InvestorWalletDashboard";
import { getMyWithdrawalsFn, getWalletSummaryFn } from "@/lib/api/wallet.functions";

const walletSearchSchema = z.object({
  deposit: z.enum(["success", "failed"]).optional(),
});

export const Route = createFileRoute("/app/wallet")({
  validateSearch: walletSearchSchema,
  head: () => ({ meta: [{ title: "Wallet — GText Farms" }] }),
  loader: async () => {
    const [summary, withdrawals] = await Promise.all([
      getWalletSummaryFn(),
      getMyWithdrawalsFn(),
    ]);
    return { summary, withdrawals };
  },
  component: WalletPage,
});

function WalletPage() {
  const { summary, withdrawals } = Route.useLoaderData();
  const { deposit } = Route.useSearch();
  const { user } = useRouteContext({ from: "__root__" });

  useEffect(() => {
    if (deposit === "success") {
      toast.success("Deposit received — your wallet balance will update shortly.");
    } else if (deposit === "failed") {
      toast.error("Deposit was not completed. Please try again.");
    }
  }, [deposit]);

  if ("error" in summary) {
    return (
      <main className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{summary.error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest">Wallet</p>
          <h1 className="mt-2 font-display text-3xl text-forest-deep md:text-4xl">
            Fund your account
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Add Naira via Paystack, invest in farm cycles, and withdraw returns to your bank
            account.
          </p>
        </div>

        <InvestorWalletDashboard summary={summary} withdrawals={withdrawals} user={user} />
      </div>
    </main>
  );
}
