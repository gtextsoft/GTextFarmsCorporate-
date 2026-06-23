import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getCoopDashboardFn } from "@/lib/api/coop.functions";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/co-operative/dashboard")({
  loader: async () => {
    const result = await getCoopDashboardFn();
    if ("error" in result) {
      return { error: result.error, stats: null };
    }
    return { error: null, stats: result };
  },
  head: () => ({ meta: [{ title: "Dashboard — GText Co-operative" }] }),
  component: CoopDashboardPage,
});

function CoopDashboardPage() {
  const { user } = useRouteContext({ from: "__root__" });
  const { error, stats } = Route.useLoaderData();

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Member dashboard"
          title={`Welcome, ${user?.fullName?.split(" ")[0] ?? "member"}.`}
          sub={
            stats?.membershipNumber
              ? `Membership #${stats.membershipNumber} — fund your account to start investing.`
              : "Your co-operative member dashboard."
          }
        />

        {error && (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Available for investment"
            value={formatNaira(stats?.balance ?? 0)}
            hint="Credited after admin confirms your bank payment"
          />
          <KpiCard
            label="Available for withdrawal"
            value={formatNaira(0)}
            hint="Monthly returns — Phase 2"
          />
          <KpiCard
            label="Total invested"
            value={formatNaira(stats?.totalInvested ?? 0)}
          />
          <KpiCard
            label="Active investments"
            value={String(stats?.activeInvestments ?? 0)}
          />
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <h3 className="font-semibold">Next steps</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Manual bank payment, investment packages, and farm records are coming in Phase 2.
            You are now a <strong>full member</strong> — we will notify you when funding opens.
          </p>
        </div>
      </div>
    </main>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
