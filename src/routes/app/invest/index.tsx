import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { OpportunityCard } from "@/components/marketing/OpportunityCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listInvestOpportunitiesFn } from "@/lib/api/cycles.functions";
import { opportunities as fallbackOpportunities } from "@/lib/mock-data";

export const Route = createFileRoute("/app/invest/")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  head: () => ({ meta: [{ title: "Invest — GText Farms" }] }),
  loader: async () => {
    const raw = await listInvestOpportunitiesFn();
    if ("error" in raw) {
      return { openCycles: [] as typeof fallbackOpportunities, otherCycles: [] as typeof fallbackOpportunities, error: raw.error };
    }
    const opportunities = raw.length > 0 ? raw : fallbackOpportunities;
    const openCycles = opportunities.filter((o) => o.status === "funding");
    const otherCycles = opportunities.filter((o) => o.status !== "funding");
    return { openCycles, otherCycles, error: undefined as string | undefined };
  },
  component: InvestBrowsePage,
});

function InvestBrowsePage() {
  const { openCycles, otherCycles, error } = Route.useLoaderData();

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {error && (
          <p className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <SectionHeader
          eyebrow="Invest"
          title="Open investment cycles."
          sub="Browse verified poultry cycles, review the financials, and invest directly from your wallet."
        />

        {openCycles.length === 0 && otherCycles.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">
              No investment cycles are available right now. Check back soon or contact support.
            </p>
            <Link
              to="/app/wallet"
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Fund your wallet
            </Link>
          </div>
        ) : (
          <>
            {openCycles.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Open for investment
                </h2>
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {openCycles.map((o) => (
                    <OpportunityCard key={o.slug} opportunity={o} />
                  ))}
                </div>
              </div>
            )}

            {openCycles.length === 0 && (
              <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/30 p-8 text-center">
                <p className="text-muted-foreground">
                  No cycles are accepting new investments at the moment.
                </p>
              </div>
            )}

            {otherCycles.length > 0 && (
              <div className="mt-14">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Other cycles
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Active or closed cycles for reference — new investments may not be available.
                </p>
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherCycles.map((o) => (
                    <OpportunityCard key={o.slug} opportunity={o} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
