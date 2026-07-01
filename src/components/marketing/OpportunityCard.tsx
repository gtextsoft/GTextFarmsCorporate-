import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Field } from "@/components/marketing/ui";
import type { Opportunity } from "@/lib/mock-data";

export function OpportunityCard({ opportunity: o }: { opportunity: Opportunity }) {
  const statusLabel =
    o.status === "funding" ? "Funding" : o.status === "active" ? "Active" : o.status;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft ring-1 ring-border/40 transition hover:-translate-y-0.5 hover:shadow-lifted">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={o.img}
          alt={o.title}
          width={800}
          height={550}
          loading="lazy"
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
          {o.type}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <span className="size-1.5 rounded-full bg-forest-deep" /> {statusLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {o.location}
        </div>
        <h3 className="mt-2 font-display text-2xl leading-tight">{o.title}</h3>

        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <Field label="ROI" value={o.roi} accent />
          <Field label="Duration" value={o.duration} />
          <Field label="Risk" value={o.risk} />
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span><span className="font-numeric font-semibold text-foreground">{o.raised}</span> raised</span>
            <span><span className="font-numeric font-semibold">{o.target}</span> target</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-forest-deep"
              style={{ width: `${o.filled}%` }}
            />
          </div>
        </div>

        <Link
          to="/app/invest/opportunity/$cycleSlug"
          params={{ cycleSlug: o.slug }}
          className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          View opportunity <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
