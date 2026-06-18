import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { MapPin, ShieldAlert } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { InvestCta } from "@/components/marketing/InvestCta";
import { Field } from "@/components/marketing/ui";
import { InvestmentTermsTable } from "@/components/marketing/trust/InvestmentTermsTable";
import { UnitEconomicsTable } from "@/components/marketing/trust/UnitEconomicsTable";
import { UseOfFundsTable } from "@/components/marketing/trust/UseOfFundsTable";
import { VerificationBadges } from "@/components/marketing/trust/VerificationBadges";
import { WorstCaseScenarios } from "@/components/marketing/trust/WorstCaseScenarios";
import { getFarmFn, getOpportunityFn } from "@/lib/api/cycles.functions";
import { getPublishedReportsForCycleFn } from "@/lib/api/field-reports.functions";
import type { FieldReportView } from "@/lib/field-report-mapper";
import type { Farm, Opportunity } from "@/lib/mock-data";

export const Route = createFileRoute("/opportunities/$cycleId")({
  head: ({ params }) => ({
    meta: [
      { title: `Investment opportunity — ${params.cycleId}` },
      {
        name: "description",
        content: "Poultry investment opportunity on GText Farms.",
      },
    ],
  }),
  loader: async ({
    params,
  }): Promise<{ cycle: Opportunity; farm: Farm | null; fieldReports: FieldReportView[] }> => {
    const [cycle, fieldReports] = await Promise.all([
      getOpportunityFn({ data: { slug: params.cycleId } }),
      getPublishedReportsForCycleFn({ data: { cycleSlug: params.cycleId } }),
    ]);
    if (!cycle) throw notFound();
    const farm = await getFarmFn({ data: { slug: cycle.farmSlug } });
    return { cycle, farm, fieldReports };
  },
  component: OpportunityDetailPage,
});

function OpportunityDetailPage() {
  const { cycle, farm, fieldReports } = Route.useLoaderData();

  return (
    <MarketingLayout>
      <section className="px-6 pb-24 pt-10 md:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl shadow-lifted">
            <img
              src={cycle.img}
              alt={cycle.title}
              width={1920}
              height={800}
              className="aspect-[21/9] size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
                  {cycle.type}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <span className="size-1.5 rounded-full bg-forest-deep" />
                  {cycle.status === "funding" ? "Funding" : "Active"}
                </span>
              </div>
              <h1 className="mt-4 font-display text-4xl text-primary-foreground md:text-6xl">
                {cycle.title}
              </h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-primary-foreground/80">
                <MapPin className="size-4" />
                {cycle.farmName} · {cycle.location}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="space-y-10 lg:col-span-8">
              <div>
                <h2 className="font-display text-3xl">Overview</h2>
                <p className="mt-4 text-muted-foreground">{cycle.description}</p>
                <p className="mt-3 text-sm font-medium text-forest-deep">{cycle.ownershipModel}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="ROI estimate" value={cycle.roi} accent />
                  <Field label="Duration" value={cycle.duration} />
                  <Field label="Risk" value={cycle.risk} />
                  <Field label="Minimum" value={cycle.minimumInvestment} />
                </div>
              </div>

              <UseOfFundsTable items={cycle.useOfFunds} target={cycle.target} />
              <UnitEconomicsTable economics={cycle.unitEconomics} />
              <InvestmentTermsTable terms={cycle.investmentTerms} />
              <WorstCaseScenarios scenarios={cycle.worstCaseScenarios} />

              {(fieldReports.length > 0 || cycle.journal.length > 0) && (
                <div>
                  <h2 className="font-display text-3xl">Cycle journal</h2>
                  <ul className="mt-6 space-y-4">
                    {fieldReports.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-xl border border-border bg-card p-4"
                      >
                        <div className="text-xs font-medium uppercase tracking-wide text-forest">
                          Week {entry.weekNumber} · {entry.title}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">By {entry.authorName}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{entry.body}</p>
                        {entry.mortalityRate != null && (
                          <p className="mt-2 text-xs font-medium text-forest-deep">
                            Mortality: {entry.mortalityRate}%
                            {entry.fcr != null ? ` · FCR: ${entry.fcr}` : ""}
                          </p>
                        )}
                      </li>
                    ))}
                    {fieldReports.length === 0 &&
                      cycle.journal.map((entry) => (
                        <li
                          key={`${entry.week}-${entry.title}`}
                          className="rounded-xl border border-border bg-card p-4"
                        >
                          <div className="text-xs font-medium uppercase tracking-wide text-forest">
                            {entry.week} · {entry.title}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{entry.note}</p>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {cycle.risks.length > 0 && (
                <div>
                  <h2 className="font-display text-3xl">Key risks</h2>
                  <ul className="mt-6 space-y-3">
                    {cycle.risks.map((risk) => (
                      <li
                        key={risk}
                        className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm"
                      >
                        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Funding progress
                </div>
                <div className="mt-2 font-display text-3xl">{cycle.filled}%</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {cycle.raised} raised of {cycle.target}
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${cycle.filled}%` }}
                  />
                </div>
                <div className="mt-6">
                  <InvestCta cycleSlug={cycle.slug} />
                </div>
              </div>

              {farm && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="font-semibold">{farm.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {farm.location}, {farm.state}
                  </p>
                  <div className="mt-4">
                    <VerificationBadges verification={farm.verification} compact />
                  </div>
                  <Link
                    to="/farms/$farmSlug"
                    params={{ farmSlug: farm.slug }}
                    className="mt-4 inline-flex text-sm font-medium text-forest-deep hover:underline"
                  >
                    View farm profile →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
