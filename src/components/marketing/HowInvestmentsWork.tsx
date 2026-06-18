import { Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText, Handshake, Scale, Wallet } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";

const points = [
  {
    icon: <Handshake className="size-5" />,
    title: "Profit-sharing, not shares",
    body: "You fund a specific production cycle on a named farm. Returns come from net profits after documented costs — not equity or dividends.",
  },
  {
    icon: <Wallet className="size-5" />,
    title: "Not a loan",
    body: "GText Farms is not lending you money or borrowing from you. Your capital is deployed into poultry operations with proportional profit participation.",
  },
  {
    icon: <Scale className="size-5" />,
    title: "CAC-registered entity",
    body: "GText Farms Ltd. (RC 1834022) operates under Nigerian company law. Funds are segregated from operating capital per our custodian arrangement.",
  },
  {
    icon: <FileText className="size-5" />,
    title: "Written agreement per cycle",
    body: "Every investment is governed by a cycle-specific agreement covering duration, profit calculation, mortality buffer, and payout terms.",
  },
];

export function HowInvestmentsWork() {
  return (
    <section id="legal" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Legal structure"
          title="How GText Farms investments work."
          sub="Plain answers to the questions every serious investor asks before wiring money."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {points.map((p) => (
            <div
              key={p.title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                {p.icon}
              </div>
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-bone/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            GText Farms is not a licensed fund manager or SEC-regulated collective investment scheme.
            Investments are in agricultural production cycles with disclosed risks.
          </p>
          <Link
            to="/legal/investment-agreement"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-deep hover:underline"
          >
            Read full investment agreement
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
