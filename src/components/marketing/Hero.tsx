import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Activity,
} from "lucide-react";

import { Badge, Stat } from "@/components/marketing/ui";
import { images } from "@/lib/images";
import { brand } from "@/lib/brand";
import type { Opportunity } from "@/lib/mock-data";

export function Hero({ featuredCycle }: { featuredCycle: Opportunity }) {
  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-10 md:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lifted">
          <img
            src={images.heroFarm}
            alt="Modern poultry farm interior with rows of healthy white broiler chickens in warm light"
            width={1920}
            height={1080}
            className="absolute inset-0 size-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/85 to-transparent" />

          <div className="relative grid gap-10 p-8 sm:p-12 md:grid-cols-12 md:p-16">
            <div className="md:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground/90 backdrop-blur">
                <span className="size-1.5 rounded-full bg-accent" />
                {featuredCycle.title} ·{" "}
                {featuredCycle.status === "funding" ? "Now funding" : "Active"}
              </span>

              <h1 className="mt-6 text-balance font-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
                {brand.headline}
              </h1>

              <p className="mt-6 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
                {brand.subheadline} Start with our {brand.investmentProgram} - weekly field reports,
                transparent unit economics, and realistic returns from real production.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/opportunities"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
                >
                  Start investing
                  <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  to="/farms"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/5 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View a live farm
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-primary-foreground/70">
                <Badge icon={<ShieldCheck className="size-3.5" />} label="CAC Registered" />
                <Badge icon={<CheckCircle2 className="size-3.5" />} label="NDPR Compliant" />
                <Badge icon={<Activity className="size-3.5" />} label="Audited Operations" />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/95 p-5 text-foreground shadow-lifted">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-forest opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-forest" />
                    </span>
                    Live · {featuredCycle.location}
                  </div>
                  <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forest-deep">
                    {featuredCycle.filled}% funded
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl">{featuredCycle.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {featuredCycle.birdCount?.toLocaleString() ?? "—"} birds · {featuredCycle.duration}{" "}
                  cycle
                </p>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${featuredCycle.filled}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{featuredCycle.raised} raised</span>
                  <span>of {featuredCycle.target} target</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Stat
                    label="Expected ROI"
                    value={`${featuredCycle.roiMin}–${featuredCycle.roiMax}%`}
                  />
                  <Stat label="Duration" value={`${featuredCycle.durationMonths} mo`} />
                  <Stat label="Min." value={featuredCycle.minimumInvestment} />
                </div>

                {featuredCycle.journal[0] && (
                  <div className="mt-5 rounded-xl bg-secondary p-4">
                    <p className="text-xs text-muted-foreground">
                      {featuredCycle.journal[0].week} update
                    </p>
                    <p className="mt-1 text-sm">{featuredCycle.journal[0].note}</p>
                  </div>
                )}

                <Link
                  to="/opportunities/$cycleId"
                  params={{ cycleId: featuredCycle.slug }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  View opportunity
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
