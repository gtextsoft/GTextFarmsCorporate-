import { createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";

import { InvestBrowse } from "@/components/app/InvestBrowse";
import { listInvestOpportunitiesFn } from "@/lib/api/cycles.functions";
import { getDashboardSummaryFn } from "@/lib/api/wallet.functions";
import { opportunities as fallbackOpportunities } from "@/lib/mock-data";

export const Route = createFileRoute("/app/invest/")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  head: () => ({ meta: [{ title: "Invest — GText Farms" }] }),
  loader: async () => {
    const [raw, summary] = await Promise.all([
      listInvestOpportunitiesFn(),
      getDashboardSummaryFn(),
    ]);
    const availableBalance = "error" in summary ? 0 : summary.availableBalance;

    if ("error" in raw) {
      return {
        openCycles: [] as typeof fallbackOpportunities,
        otherCycles: [] as typeof fallbackOpportunities,
        availableBalance,
        error: raw.error,
      };
    }
    const opportunities = raw.length > 0 ? raw : fallbackOpportunities;
    const openCycles = opportunities.filter((o) => o.status === "funding");
    const otherCycles = opportunities.filter((o) => o.status !== "funding");
    return { openCycles, otherCycles, availableBalance, error: undefined as string | undefined };
  },
  component: InvestBrowsePage,
});

function InvestBrowsePage() {
  const { user } = useRouteContext({ from: "__root__" });
  const { openCycles, otherCycles, availableBalance, error } = Route.useLoaderData();

  return (
    <InvestBrowse
      openCycles={openCycles}
      otherCycles={otherCycles}
      availableBalance={availableBalance}
      kycStatus={user?.kycStatus}
      error={error}
    />
  );
}
