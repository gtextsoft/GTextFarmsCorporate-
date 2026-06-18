import { Link } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { PayoutRecord } from "@/lib/mock-data";

export function PayoutProof({ lastPayout }: { lastPayout: PayoutRecord | null }) {
  if (!lastPayout) return null;

  return (
    <section className="bg-bone/60 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Payout proof"
          title="Last cycle payout."
          sub="Real capital returned and profit distributed to investors — not just projections."
        />

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-lifted md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest-deep">
                <BadgeCheck className="size-3.5" />
                Verified payout
              </div>
              <h3 className="mt-4 font-display text-3xl">{lastPayout.cycleTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Paid {lastPayout.payoutDate}</p>
            </div>
            <Link
              to="/performance"
              hash="payouts"
              className="text-sm font-medium text-forest-deep hover:underline"
            >
              View all payouts →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Investors paid", value: lastPayout.investors.toLocaleString() },
              { label: "Capital returned", value: lastPayout.capitalReturned },
              { label: "Profit paid", value: lastPayout.profitPaid },
              { label: "Payout date", value: lastPayout.payoutDate },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-secondary p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </div>
                <div className="mt-1 font-display text-2xl text-forest-deep">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
