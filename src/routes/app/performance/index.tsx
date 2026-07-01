import { Link, createFileRoute } from "@tanstack/react-router";

import { InvestorPerformanceCharts } from "@/components/app/InvestorPerformanceCharts";
import { SectionHeader } from "@/components/marketing/SectionHeader";
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
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{performance.error}</p>
      </main>
    );
  }

  const hasInvestments = performance.portfolioAllocation.length > 0;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Farm transparency"
          title="Performance charts."
          sub="Mortality, feed conversion, and production metrics from published field reports on cycles you've invested in."
        />

        {!hasInvestments ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">Invest in a cycle to track farm performance here.</p>
            <Link
              to="/app/invest"
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Browse opportunities
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/app/activity"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Weekly field reports
              </Link>
              <Link
                to="/app/investments"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                My investments
              </Link>
            </div>

            <div className="mt-10">
              <InvestorPerformanceCharts data={performance} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
