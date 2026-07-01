import { Link, createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

import { InvestorPerformanceDashboard } from "@/components/app/InvestorPerformanceDashboard";
import { Button } from "@/components/ui/button";
import { getInvestorPerformanceFn } from "@/lib/api/investor.performance.functions";

export const Route = createFileRoute("/app/performance/")({
  head: () => ({ meta: [{ title: "Farm Performance — GText Farms" }] }),
  loader: () => getInvestorPerformanceFn(),
  component: PerformancePage,
});

function PerformancePage() {
  const performance = Route.useLoaderData();

  if ("error" in performance) {
    return (
      <main className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{performance.error}</p>
        </div>
      </main>
    );
  }

  const hasInvestments = performance.portfolioAllocation.length > 0;

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest">
              Farm transparency
            </p>
            <h1 className="mt-2 font-display text-3xl text-forest-deep md:text-4xl">
              Performance
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Mortality, feed conversion, egg production, and portfolio metrics from published
              field reports on cycles you&apos;ve invested in.
            </p>
          </div>
          {hasInvestments && (
            <Button asChild variant="outline" className="shrink-0 rounded-xl">
              <Link to="/app/activity">
                <BarChart3 className="size-4" />
                Field reports
              </Link>
            </Button>
          )}
        </div>

        <InvestorPerformanceDashboard data={performance} />
      </div>
    </main>
  );
}
