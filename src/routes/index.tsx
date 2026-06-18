import { createFileRoute } from "@tanstack/react-router";

import { CTA } from "@/components/marketing/CTA";
import { FAQ } from "@/components/marketing/FAQ";
import { GalleryPreview } from "@/components/marketing/GalleryPreview";
import { Hero } from "@/components/marketing/Hero";
import { HowInvestmentsWork } from "@/components/marketing/HowInvestmentsWork";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LiveFarm } from "@/components/marketing/LiveFarm";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { OpportunitiesSection } from "@/components/marketing/OpportunitiesSection";
import { PayoutProof } from "@/components/marketing/PayoutProof";
import { Reports } from "@/components/marketing/Reports";
import { Team } from "@/components/marketing/Team";
import { TrackRecord } from "@/components/marketing/TrackRecord";
import { TrustBar } from "@/components/marketing/TrustBar";
import { WhatWeDo } from "@/components/marketing/WhatWeDo";
import {
  getPlatformStatsFn,
  listFarmsFn,
  listOpportunitiesFn,
} from "@/lib/api/cycles.functions";
import { getPublicFaqFn, getPublicGalleryFn, getPublicTeamFn } from "@/lib/api/content.functions";
import { getPublicPerformanceFn } from "@/lib/api/performance.functions";
import { brand, brandTitle } from "@/lib/brand";
import { buildTrustBarStats } from "@/lib/platform-stats";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [opportunityList, platformStats, farmList, performance, faqItems, teamMembers, galleryItems] =
      await Promise.all([
      listOpportunitiesFn(),
      getPlatformStatsFn(),
      listFarmsFn(),
      getPublicPerformanceFn(),
      getPublicFaqFn(),
      getPublicTeamFn(),
      getPublicGalleryFn(),
    ]);

    const featuredFarm = farmList[0] ?? null;
    const featuredCycle =
      (featuredFarm?.activeCycleSlug
        ? opportunityList.find((o) => o.slug === featuredFarm.activeCycleSlug)
        : undefined) ??
      opportunityList.find((o) => o.status === "funding") ??
      opportunityList[0] ??
      null;

    return {
      opportunities: opportunityList,
      trustBarStats: buildTrustBarStats(platformStats),
      featuredFarm,
      featuredJournal: featuredCycle?.journal ?? [],
      featuredCycle,
      completedCycles: performance.completedCycles,
      lastPayout: performance.lastPayout,
      faqItems,
      teamMembers,
      galleryItems,
    };
  },
  head: () => ({
    meta: [
      { title: brandTitle("Invest in Real Poultry Farms") },
      {
        name: "description",
        content:
          `${brand.name} — ${brand.tagline} Invest in verified Nigerian poultry farms with weekly reports and transparent financials.`,
      },
      { property: "og:title", content: brandTitle("Agricultural Investment Platform") },
      {
        property: "og:description",
        content:
          "Verified farms. Weekly field reports. Transparent financials. Realistic returns from real poultry cycles.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const {
    opportunities,
    trustBarStats,
    featuredFarm,
    featuredJournal,
    featuredCycle,
    completedCycles,
    lastPayout,
    faqItems,
    teamMembers,
    galleryItems,
  } = Route.useLoaderData();

  return (
    <MarketingLayout>
      {featuredCycle && <Hero featuredCycle={featuredCycle} />}
      <TrustBar stats={trustBarStats} />
      <TrackRecord completedCycles={completedCycles} />
      <PayoutProof lastPayout={lastPayout} />
      <HowItWorks />
      {featuredFarm && <LiveFarm farm={featuredFarm} journal={featuredJournal} />}
      <OpportunitiesSection opportunities={opportunities} limit={3} />
      <Reports />
      <GalleryPreview items={galleryItems} />
      <HowInvestmentsWork />
      <WhatWeDo />
      <Team members={teamMembers} />
      <FAQ items={faqItems} />
      <CTA />
    </MarketingLayout>
  );
}
