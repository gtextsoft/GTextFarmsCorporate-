import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MiniStat } from "@/components/marketing/ui";
import { images } from "@/lib/images";
import type { CycleJournalEntry, Farm } from "@/lib/mock-data";

interface LiveFarmProps {
  farm: Farm;
  journal: CycleJournalEntry[];
}

export function LiveFarm({ farm, journal }: LiveFarmProps) {
  return (
    <section id="farms" className="bg-card px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Live farm"
          title="See the farm. Watch the cycle. Trust the numbers."
          sub="Every GText Farms farm publishes weekly photo updates, vaccination logs, mortality reports, and feed records. No black boxes."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <Link
            to="/farms/$farmSlug"
            params={{ farmSlug: farm.slug }}
            className="relative overflow-hidden rounded-2xl shadow-soft lg:col-span-7"
          >
            <img
              src={farm.heroImage}
              alt="Aerial view of a modern poultry farm complex with rows of white barns"
              width={1600}
              height={900}
              loading="lazy"
              className="aspect-[16/10] size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-4 p-6 text-primary-foreground">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="size-3.5" /> {farm.location}, {farm.state}
                </div>
                <h3 className="mt-1 font-display text-3xl">{farm.name}</h3>
                <p className="text-sm text-primary-foreground/75">
                  {farm.capacity} · {farm.cyclesPerYear} cycles per year
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-ink/40 px-4 py-3 backdrop-blur">
                <MiniStat label="Birds" value={farm.birdCount} />
                <MiniStat label="Mortality" value={farm.mortality} />
                <MiniStat label="FCR" value={farm.fcr} />
              </div>
            </div>
          </Link>

          <div className="grid gap-6 lg:col-span-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="overflow-hidden rounded-2xl shadow-soft">
                <img
                  src={images.workerBird}
                  alt="Farm worker holding healthy chicken"
                  width={1200}
                  height={1500}
                  loading="lazy"
                  className="aspect-[4/5] size-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl shadow-soft">
                <img
                  src={images.eggLine}
                  alt="Eggs on stainless conveyor"
                  width={1200}
                  height={900}
                  loading="lazy"
                  className="aspect-[4/5] size-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Cycle journal</h4>
                <span className="text-xs text-muted-foreground">Latest updates</span>
              </div>
              <ul className="mt-4 space-y-3">
                {journal.map((u) => (
                  <li key={u.week} className="flex gap-3">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-forest" />
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-forest">
                        {u.week} · {u.title}
                      </div>
                      <div className="text-sm text-muted-foreground">{u.note}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
