import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, MapPin, Sprout, Video, VideoOff } from "lucide-react";

import type { CyclePerformanceSeries } from "@/lib/api/investor.performance.functions";

function CameraTile({ cycle }: { cycle: CyclePerformanceSeries }) {
  const isActive = cycle.status === "active" || cycle.status === "confirmed";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative aspect-video bg-gradient-to-br from-forest-deep to-ink">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/85">
          <VideoOff className="size-8 opacity-70" />
          <p className="mt-2 text-sm font-medium">Camera offline</p>
          <p className="mt-0.5 text-xs text-white/60">Live feed coming soon</p>
        </div>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <span className="size-1.5 rounded-full bg-white/60" />
          Offline
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {cycle.farmName}
        </div>
        <h3 className="mt-1 font-semibold leading-snug">{cycle.cycleTitle}</h3>
        <p className="mt-1 text-xs capitalize text-muted-foreground">
          {isActive ? "Cycle in progress" : cycle.status}
        </p>
        <Link
          to="/app/activity"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-forest-deep hover:underline"
        >
          View field updates
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function FarmLive({ cycles }: { cycles: CyclePerformanceSeries[] }) {
  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-deep">
            Farm monitoring
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            View farm live
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Watch the farms behind your investments in real time. Live cameras are being installed
            now — here&apos;s what&apos;s coming and how to follow your cycles today.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-forest/20 bg-gradient-to-br from-forest-deep to-ink text-white shadow-soft">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
                <Video className="size-6" />
              </span>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/20 px-2.5 py-1 text-[11px] font-semibold text-lime">
                  Coming soon
                </span>
                <h2 className="mt-2 text-lg font-semibold">Live camera access is on the way</h2>
                <p className="mt-1 max-w-xl text-sm text-white/70">
                  We&apos;re rolling out 24/7 CCTV so you can check on pens, feed stores, and egg
                  collection any time. Until then, verified field officers publish weekly reports
                  with photos and production metrics.
                </p>
              </div>
            </div>
            <Link
              to="/app/activity"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lime px-5 py-2.5 text-sm font-semibold text-forest-deep transition hover:opacity-90"
            >
              <Sprout className="size-4" />
              View field updates
            </Link>
          </div>
        </div>

        {cycles.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Your farms
              </h2>
              <span className="text-xs text-muted-foreground">
                {cycles.length} location{cycles.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cycles.map((cycle) => (
                <CameraTile key={cycle.cycleSlug} cycle={cycle} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
              <Video className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No farms to watch yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Once you invest in a cycle, the farm behind it will appear here — and you&apos;ll be
              first to see the live feed when cameras go online.
            </p>
            <Link
              to="/app/invest"
              className="mt-5 inline-flex rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse opportunities
            </Link>
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest-deep">
            <Bell className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">Get notified when cameras go live</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll send you a notification the moment live monitoring is available for your
              farms.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
