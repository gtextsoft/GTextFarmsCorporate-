import { createFileRoute } from "@tanstack/react-router";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { OpportunityCard } from "@/components/marketing/OpportunityCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listOpportunitiesFn } from "@/lib/api/cycles.functions";

export const Route = createFileRoute("/opportunities/")({
  loader: () => listOpportunitiesFn(),
  head: () => ({
    meta: [
      { title: "Investment Opportunities — GText Farms" },
      {
        name: "description",
        content:
          "Browse open poultry investment cycles across Nigeria. Realistic ROI ranges, transparent financials, and verified farm operations.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const opportunities = Route.useLoaderData();

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Open opportunities"
            title="Invest in verified poultry cycles."
            sub="Every opportunity includes a full financial breakdown, farm location, risk profile, and weekly operational updates."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <OpportunityCard key={o.slug} opportunity={o} />
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
