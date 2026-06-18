import type { ReactNode } from "react";

import { SectionHeader } from "@/components/marketing/SectionHeader";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <article className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow="Legal" title={title} />
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
