import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PayoutHistory } from "@/components/marketing/PayoutHistory";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getPublicPerformanceFn } from "@/lib/api/performance.functions";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/performance/")({
  loader: () => getPublicPerformanceFn(),
  head: () =>
    buildPageHead({
      title: "Investment Performance & Track Record",
      description:
        "Public track record for GText Farms poultry investments — completed cycles, verified payouts, historical ROI, and platform statistics for prospective investors in Nigeria.",
      path: "/performance",
    }),
  component: PerformancePage,
});

function PerformancePage() {
  const { summary, platformStats, completedCycles, payoutHistory } = Route.useLoaderData();

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Platform performance"
            title="Proof, not promises."
            sub="Completed cycles, verified payouts, and historical ROI — publicly available for every prospective investor."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Total cycles run", value: String(summary.totalCycles) },
              { label: "Completed successfully", value: String(summary.completedCycles) },
              { label: "Success rate", value: summary.successRate },
              { label: "Total paid out", value: summary.totalPaidOut },
              { label: "Avg ROI delivered", value: summary.avgRoiDelivered },
              { label: "Total investors", value: summary.totalInvestors.toLocaleString() },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </div>
                <div className="mt-2 font-numeric text-3xl font-bold text-forest-deep">{stat.value}</div>
              </div>
            ))}
          </div>

          <div id="completed-cycles" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-3xl">Completed cycles</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Projected vs delivered ROI on every closed cycle.
            </p>
            {completedCycles.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">No completed cycles published yet.</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Cycle</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Farm</th>
                      <th className="px-4 py-3">Projected</th>
                      <th className="px-4 py-3">Delivered</th>
                      <th className="hidden px-4 py-3 md:table-cell">Investors</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {completedCycles.map((cycle) => (
                      <tr key={cycle.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-medium">
                            <CheckCircle2 className="size-4 text-forest-deep" />
                            {cycle.title}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {cycle.farmName}
                        </td>
                        <td className="px-4 py-3 font-numeric">{cycle.roiProjected}</td>
                        <td className="px-4 py-3 font-numeric font-semibold text-forest-deep">
                          {cycle.roiDelivered}
                        </td>
                        <td className="hidden px-4 py-3 font-numeric text-muted-foreground md:table-cell">
                          {cycle.investors}
                        </td>
                        <td className="px-4 py-3 font-numeric text-muted-foreground">{cycle.completedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {platformStats.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-3xl">Platform at a glance</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {platformStats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                    <div className="font-numeric text-2xl font-bold text-forest-deep">{s.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/auth/sign-in"
              className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Browse open opportunities
            </Link>
          </div>
        </div>
      </section>

      <PayoutHistory payouts={payoutHistory} />
    </MarketingLayout>
  );
}
