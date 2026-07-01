import { createFileRoute } from "@tanstack/react-router";

import { CTA } from "@/components/marketing/CTA";
import { FAQ } from "@/components/marketing/FAQ";
import { GalleryPreview } from "@/components/marketing/GalleryPreview";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LiveFarm } from "@/components/marketing/LiveFarm";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { OpportunitiesSection } from "@/components/marketing/OpportunitiesSection";
import { TrackRecord } from "@/components/marketing/TrackRecord";
import { TrustBar } from "@/components/marketing/TrustBar";
import {
  getPlatformStatsFn,
  listFarmsFn,
  listOpportunitiesFn,
} from "@/lib/api/cycles.functions";
import { getPublicFaqFn, getPublicGalleryFn } from "@/lib/api/content.functions";
import { getPublicPerformanceFn } from "@/lib/api/performance.functions";
import { buildPageHead } from "@/lib/seo";
import { farms as fallbackFarms, opportunities as fallbackOpportunities } from "@/lib/mock-data";
import { buildTrustBarStats } from "@/lib/platform-stats";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [opportunityListRaw, platformStats, farmList, performance, faqItems, galleryItems] =
      await Promise.all([
      listOpportunitiesFn(),
      getPlatformStatsFn(),
      listFarmsFn(),
      getPublicPerformanceFn(),
      getPublicFaqFn(),
      getPublicGalleryFn(),
    ]);

    const opportunityList =
      opportunityListRaw.length > 0 ? opportunityListRaw : fallbackOpportunities;
    const farms = farmList.length > 0 ? farmList : fallbackFarms;

    const featuredFarm = farms[0] ?? null;
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
      faqItems,
      galleryItems,
    };
  },
  head: () =>
    buildPageHead({
      title: "Invest in Real Nigerian Poultry Farms",
      description:
        "Fund verified poultry cycles with GText Farms — a GText Holdings agricultural company. Weekly field reports, transparent financials, and farm-fresh produce across Nigeria.",
      path: "/",
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
    faqItems,
    galleryItems,
  } = Route.useLoaderData();

  return (
    <MarketingLayout>
      {featuredCycle ? <Hero featuredCycle={featuredCycle} /> : null}
      <TrustBar stats={trustBarStats} />
      <OpportunitiesSection opportunities={opportunities} limit={3} />
      <TrackRecord completedCycles={completedCycles} />
      <HowItWorks />
      {featuredFarm && <LiveFarm farm={featuredFarm} journal={featuredJournal} />}
      <GalleryPreview items={galleryItems} />
      <FAQ items={faqItems} />
      <CTA />
    </MarketingLayout>
  );
}
