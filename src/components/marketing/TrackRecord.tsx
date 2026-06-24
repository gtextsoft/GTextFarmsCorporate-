import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { CompletedCycle } from "@/lib/mock-data";

export function TrackRecord({ completedCycles }: { completedCycles: CompletedCycle[] }) {
  if (completedCycles.length === 0) return null;

  return (
    <section id="track-record" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Track record"
            title="Previous cycles. Delivered returns."
            sub="Projected vs actual ROI on completed cycles — the proof serious investors look for."
          />
          <Link
            to="/performance"
            hash="completed-cycles"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Full performance history
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {completedCycles.slice(0, 4).map((cycle) => (
            <article
              key={cycle.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-forest">
                  {cycle.type}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-forest-deep">
                  <CheckCircle2 className="size-3.5" />
                  {cycle.status}
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl">{cycle.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {cycle.farmName} · {cycle.completedDate}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">ROI projected</dt>
                  <dd className="font-numeric font-semibold">{cycle.roiProjected}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">ROI delivered</dt>
                  <dd className="font-numeric font-semibold text-forest-deep">{cycle.roiDelivered}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-numeric font-semibold text-foreground">{cycle.investors}</span> investors paid
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
