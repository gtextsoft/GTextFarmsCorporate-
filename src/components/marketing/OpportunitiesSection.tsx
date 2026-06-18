import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { OpportunityCard } from "@/components/marketing/OpportunityCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { Opportunity } from "@/lib/mock-data";

interface OpportunitiesSectionProps {
  opportunities: Opportunity[];
  limit?: number;
  showViewAll?: boolean;
}

export function OpportunitiesSection({
  opportunities,
  limit,
  showViewAll = true,
}: OpportunitiesSectionProps) {
  const ops = limit ? opportunities.slice(0, limit) : opportunities;

  return (
    <section id="opportunities" className="bg-bone/60 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Open opportunities"
            title="Pick a cycle. See the numbers."
            sub="Realistic ROI ranges. Honest risk profiles. Full operational cost breakdown on every opportunity."
          />
          {showViewAll && (
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-deep hover:underline"
            >
              View all opportunities <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ops.map((o) => (
            <OpportunityCard key={o.slug} opportunity={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
