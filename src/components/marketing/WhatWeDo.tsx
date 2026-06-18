import { brand } from "@/lib/brand";

export function WhatWeDo() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-deep">
            What we do
          </p>
          <h2 className="mt-2 font-display text-4xl">Integrated agriculture across Nigeria.</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            {brand.name} operates across farming, food processing, consulting, and structured
            agricultural investments — building a trusted ecosystem from field to market.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brand.businessLines.map((line) => (
            <div
              key={line.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <h3 className="font-semibold">{line.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{line.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
