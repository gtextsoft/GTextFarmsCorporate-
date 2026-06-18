import { Egg, ShieldCheck, LineChart } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { images } from "@/lib/images";

export function Reports() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-lifted">
            <img
              src={images.vet}
              alt="Veterinarian examining a chicken"
              width={1200}
              height={900}
              loading="lazy"
              className="aspect-[5/4] size-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden w-64 rounded-2xl border border-border bg-card p-4 shadow-lifted md:block">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Mortality this week</span>
              <span className="font-semibold text-forest-deep">0.9%</span>
            </div>
            <div className="mt-3 flex h-16 items-end gap-1">
              {[40, 55, 38, 62, 48, 30, 25].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-forest/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              Below 1.5% target · 7 days
            </div>
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="Operational transparency"
            title="Realistic returns. Honest risk."
            sub="We don't promise to double your money. We share the actual unit economics - feed, vaccination, labor, logistics - and the market factors that move them."
          />

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: <Egg className="size-4" />,
                t: "Verified production data",
                d: "Bird counts, FCR, and mortality recorded daily by farm officers and audited weekly.",
              },
              {
                icon: <ShieldCheck className="size-4" />,
                t: "Independent veterinary oversight",
                d: "Licensed vets sign off on every vaccination phase and health audit.",
              },
              {
                icon: <LineChart className="size-4" />,
                t: "Full financial breakdown",
                d: "Each opportunity shows feed cost, labor, logistics, and expected revenue — line by line.",
              },
            ].map((f) => (
              <li key={f.t} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold">{f.t}</div>
                  <p className="text-sm text-muted-foreground">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
