import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { useState } from "react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { faqItems as fallbackFaqItems } from "@/lib/mock-data";

type FaqItem = { q: string; a: string };

export function FAQ({ items }: { items?: FaqItem[] }) {
  const faqList = items && items.length > 0 ? items : fallbackFaqItems;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Got questions?"
            title="We've got answers."
            sub="The honest ones. If something isn't here, ask our team directly."
          />
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Talk to an investor agent <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {faqList.map((it, i) => {
              const isOpen = open === i;
              return (
                <li key={it.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 p-6 text-left"
                  >
                    <span className="font-medium">{it.q}</span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border bg-secondary text-foreground">
                      {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-muted-foreground">{it.a}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
