import { Link, createFileRoute } from "@tanstack/react-router";
import { CirclePlus } from "lucide-react";

import { InvestmentsPortfolio } from "@/components/app/InvestmentsPortfolio";
import { Button } from "@/components/ui/button";
import { getMyInvestmentsFn } from "@/lib/api/wallet.functions";

export const Route = createFileRoute("/app/investments/")({
  head: () => ({ meta: [{ title: "My Investments — GText Farms" }] }),
  loader: () => getMyInvestmentsFn(),
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const investments = Route.useLoaderData();

  if ("error" in investments) {
    return (
      <main className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{investments.error}</p>
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
              Portfolio
            </p>
            <h1 className="mt-2 font-display text-3xl text-forest-deep md:text-4xl">
              My investments
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Track your cycle participations, projected returns, progress, and certificates in
              one place.
            </p>
          </div>
          {investments.length > 0 && (
            <Button asChild className="shrink-0 rounded-xl">
              <Link to="/app/invest">
                <CirclePlus className="size-4" />
                New investment
              </Link>
            </Button>
          )}
        </div>

        <InvestmentsPortfolio investments={investments} />
      </div>
    </main>
  );
}
