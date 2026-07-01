import { Sprout, Wallet, Activity, LineChart } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";

const steps = [
  {
    icon: <Sprout className="size-5" />,
    title: "Choose a cycle",
    body: "Browse active broiler, layer, feed, and processing cycles with full unit economics.",
  },
  {
    icon: <Wallet className="size-5" />,
    title: "Fund your wallet",
    body: "Top up by bank transfer or card. Submit your BVN/NIN once for our team to review.",
  },
  {
    icon: <Activity className="size-5" />,
    title: "Track live operations",
    body: "Weekly field reports, vaccination logs, feed conversion ratios - straight from the farm.",
  },
  {
    icon: <LineChart className="size-5" />,
    title: "Earn at cycle end",
    body: "Principal and ROI land in your wallet at harvest. Withdraw or reinvest in one tap.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-bone/50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="How it works"
          title="Four steps from signup to payout."
          sub="No jargon. No middlemen. Just real birds on real farms producing real returns."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  {s.icon}
                </div>
                <span className="font-display text-3xl text-muted-foreground/50">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
