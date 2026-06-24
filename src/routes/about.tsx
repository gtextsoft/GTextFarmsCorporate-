import { createFileRoute } from "@tanstack/react-router";

import { CTA } from "@/components/marketing/CTA";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Team } from "@/components/marketing/Team";
import { WhatWeDo } from "@/components/marketing/WhatWeDo";
import { getPublicTeamFn } from "@/lib/api/content.functions";
import { brand, brandTitle } from "@/lib/brand";
import { getPlatformStatsFn } from "@/lib/api/cycles.functions";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const [platformStats, teamMembers] = await Promise.all([
      getPlatformStatsFn(),
      getPublicTeamFn(),
    ]);
    return { platformStats, teamMembers };
  },
  head: () => ({
    meta: [
      { title: brandTitle("About") },
      {
        name: "description",
        content: `${brand.name} — ${brand.tagline} Integrated farming, processing, consulting, and agricultural investments across Nigeria.`,
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { platformStats, teamMembers } = Route.useLoaderData();

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow={`About ${brand.name}`}
            title={brand.tagline}
            sub={brand.subheadline}
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="font-display text-2xl">Our mission</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{brand.mission}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="font-display text-2xl">Our vision</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{brand.vision}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-soft">
            <h3 className="font-display text-2xl">Core values</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {brand.values.map((value) => (
                <li
                  key={value}
                  className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium"
                >
                  {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-2xl border border-forest/30 bg-forest/5 p-8">
            <h3 className="font-display text-2xl">{brand.investmentProgram}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {brand.investmentProgramSummary}
            </p>
          </div>

          {platformStats.length > 0 && (
            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              {platformStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-numeric text-4xl font-bold text-forest-deep">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <WhatWeDo />
      <Team members={teamMembers} />
      <CTA />
    </MarketingLayout>
  );
}
