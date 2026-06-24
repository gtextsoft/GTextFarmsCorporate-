import type { TrustBarStat } from "@/lib/platform-stats";

export function TrustBar({ stats }: { stats: TrustBarStat[] }) {
  return (
    <section className="border-y border-border bg-card px-6 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        {stats.map((i) => (
          <div key={i.label}>
            <div className="font-numeric text-4xl font-bold text-forest-deep">{i.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{i.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
