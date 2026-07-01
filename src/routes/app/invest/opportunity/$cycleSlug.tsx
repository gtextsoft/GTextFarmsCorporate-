import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { OpportunityDetailView } from "@/components/invest/OpportunityDetailView";
import { getFarmFn, getOpportunityFn } from "@/lib/api/cycles.functions";
import { getPublishedReportsForCycleFn } from "@/lib/api/field-reports.functions";
import type { FieldReportView } from "@/lib/field-report-mapper";
import type { Farm, Opportunity } from "@/lib/mock-data";
import { opportunities as fallbackOpportunities } from "@/lib/mock-data";

export const Route = createFileRoute("/app/invest/opportunity/$cycleSlug")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  head: ({ params }) => ({
    meta: [{ title: `${params.cycleSlug} — Invest — GText Farms` }],
  }),
  loader: async ({
    params,
  }): Promise<{ cycle: Opportunity; farm: Farm | null; fieldReports: FieldReportView[] }> => {
    const [cycleResult, fieldReports] = await Promise.all([
      getOpportunityFn({ data: { slug: params.cycleSlug } }),
      getPublishedReportsForCycleFn({ data: { cycleSlug: params.cycleSlug } }),
    ]);

    if (cycleResult && typeof cycleResult === "object" && "error" in cycleResult) {
      throw redirect({ to: "/auth/sign-in" });
    }

    const cycle =
      (cycleResult as Opportunity | null) ??
      fallbackOpportunities.find((o) => o.slug === params.cycleSlug) ??
      null;
    if (!cycle) throw notFound();

    const farm = await getFarmFn({ data: { slug: cycle.farmSlug } });
    return { cycle, farm, fieldReports };
  },
  component: InvestOpportunityDetailPage,
});

function InvestOpportunityDetailPage() {
  const { cycle, farm, fieldReports } = Route.useLoaderData();

  return (
    <OpportunityDetailView
      cycle={cycle}
      farm={farm}
      fieldReports={fieldReports}
      backTo={{ to: "/app/invest", label: "All opportunities" }}
    />
  );
}
