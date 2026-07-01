import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { OpportunityCard } from "@/components/marketing/OpportunityCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { VerificationBadges } from "@/components/marketing/trust/VerificationBadges";
import { getCyclesForFarmFn, getFarmFn } from "@/lib/api/cycles.functions";

export const Route = createFileRoute("/farms/$farmSlug")({
  head: ({ params }) => ({
    meta: [
      { title: `Farm — ${params.farmSlug}` },
      {
        name: "description",
        content: "Verified GText Farms poultry farm profile.",
      },
    ],
  }),
  loader: async ({ params }) => {
    const [farm, cycles] = await Promise.all([
      getFarmFn({ data: { slug: params.farmSlug } }),
      getCyclesForFarmFn({ data: { farmSlug: params.farmSlug } }),
    ]);
    if (!farm) throw notFound();
    return { farm, cycles };
  },
  component: FarmProfilePage,
});

function FarmProfilePage() {
  const { farm, cycles } = Route.useLoaderData();
  const activeCycle = cycles.find((c) => c.status === "funding");

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl shadow-lifted">
            <img
              src={farm.heroImage}
              alt={farm.name}
              className="aspect-[21/9] size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
                <MapPin className="size-4" />
                {farm.location}, {farm.state}
              </div>
              <h1 className="mt-2 font-display text-4xl text-primary-foreground md:text-6xl">
                {farm.name}
              </h1>
              <p className="mt-2 text-sm text-primary-foreground/80">
                {farm.ownershipModel} · {farm.operatorName}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <div>
                <h2 className="font-display text-3xl">About this farm</h2>
                <p className="mt-4 text-muted-foreground">{farm.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Capacity", value: farm.capacity },
                  { label: "Birds", value: farm.birdCount },
                  { label: "Mortality", value: farm.mortality },
                  { label: "FCR", value: farm.fcr },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="mt-1 font-numeric text-lg font-bold text-forest-deep">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="font-display text-3xl">Cycles at this farm</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {cycles.map((cycle) => (
                    <OpportunityCard key={cycle.slug} opportunity={cycle} />
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="font-semibold">Verification</h3>
                  <div className="mt-4">
                    <VerificationBadges verification={farm.verification} />
                  </div>
                  <dl className="mt-6 space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Operations manager</dt>
                      <dd className="font-medium">{farm.managerName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Cycles per year</dt>
                      <dd className="font-numeric font-semibold">{farm.cyclesPerYear}</dd>
                    </div>
                  </dl>
                </div>

                {activeCycle && (
                  <Link
                    to="/app/invest/opportunity/$cycleSlug"
                    params={{ cycleSlug: activeCycle.slug }}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Invest in active cycle
                    <ArrowUpRight className="size-4" />
                  </Link>
                )}

                <Link
                  to="/farms"
                  className="inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  All farms
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
