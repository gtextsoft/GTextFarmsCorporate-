import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { VerificationBadges } from "@/components/marketing/trust/VerificationBadges";
import { listFarmsFn, listOpportunitiesFn } from "@/lib/api/cycles.functions";
import { images } from "@/lib/images";
import type { Farm, Opportunity } from "@/lib/mock-data";

export const Route = createFileRoute("/farms/")({
  loader: async () => {
    const [farms, opportunities] = await Promise.all([
      listFarmsFn(),
      listOpportunitiesFn(),
    ]);
    return farms.map((farm) => ({
      farm,
      activeCycle: farm.activeCycleSlug
        ? opportunities.find((o: Opportunity) => o.slug === farm.activeCycleSlug)
        : undefined,
    }));
  },
  head: () => ({
    meta: [
      { title: "Live Farms — GText Farms" },
      {
        name: "description",
        content:
          "Explore verified GText Farms poultry farms with live statistics, weekly reports, and operational transparency.",
      },
    ],
  }),
  component: FarmsPage,
});

function FarmsPage() {
  const farms = Route.useLoaderData();

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Farm transparency"
            title="Verified farms. Live operations."
            sub="Every GText Farms farm publishes weekly updates - bird counts, mortality, feed conversion, and vaccination status."
          />

          {farms.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">
              No farms published yet. Run <code className="text-sm">npm run db:seed</code> or add
              farms in admin.
            </p>
          ) : (
            <div className="mt-12 space-y-8">
              {farms.map(({ farm, activeCycle }) => (
                <FarmCard key={farm.slug} farm={farm} activeCycle={activeCycle} />
              ))}
            </div>
          )}

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-soft">
              <img
                src={images.workerBird}
                alt="Farm worker with poultry"
                className="aspect-[16/10] size-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-2xl shadow-soft">
              <img
                src={images.farmAerial}
                alt="Aerial farm view"
                className="aspect-[16/10] size-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function FarmCard({
  farm,
  activeCycle,
}: {
  farm: Farm;
  activeCycle?: Opportunity;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="grid lg:grid-cols-12">
        <div className="relative overflow-hidden lg:col-span-5 lg:max-h-[332px]">
          <img
            src={farm.heroImage}
            alt={farm.name}
            width={800}
            height={600}
            loading="lazy"
            className="aspect-[4/3] size-full object-cover lg:aspect-auto lg:h-[332px] lg:max-h-[332px]"
          />
        </div>
        <div className="flex flex-col justify-between p-6 lg:col-span-7 lg:p-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {farm.location}, {farm.state}
            </div>
            <h2 className="mt-2 font-display text-3xl">{farm.name}</h2>
            <p className="mt-1 text-sm font-medium text-forest-deep">
              {farm.ownershipModel} · {farm.operatorName}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{farm.description}</p>

            <div className="mt-4">
              <VerificationBadges verification={farm.verification} compact />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-secondary p-4">
              {[
                { label: "Birds", value: farm.birdCount },
                { label: "Mortality", value: farm.mortality },
                { label: "FCR", value: farm.fcr },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="font-numeric text-sm font-semibold">{stat.value}</div>
                </div>
              ))}
            </div>
            {farm.managerName && (
              <p className="mt-3 text-xs text-muted-foreground">
                Operations manager: {farm.managerName}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/farms/$farmSlug"
              params={{ farmSlug: farm.slug }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              View farm profile
              <ArrowUpRight className="size-4" />
            </Link>
            {activeCycle && (
              <Link
                to="/app/invest/opportunity/$cycleSlug"
                params={{ cycleSlug: activeCycle.slug }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                View active cycle
                <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
