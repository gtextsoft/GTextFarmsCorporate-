export function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-forest">
        <span className="h-px w-8 bg-forest/40" />
        {eyebrow}
      </div>
      <h2 className="mt-4 text-balance font-display text-5xl leading-[1.02] md:text-6xl">
        {title}
      </h2>
      {sub && <p className="mt-4 max-w-2xl text-base text-muted-foreground">{sub}</p>}
    </div>
  );
}
