import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

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

        {/* Entrance-fee gate: profile complete but fee not yet confirmed */}
        {stats && !stats.entranceFeePaid && (
          <div className="mt-8 rounded-2xl border border-forest/30 bg-forest/5 p-6 sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">
                {stats.pendingPayment > 0
                  ? "Entrance fee — awaiting confirmation"
                  : "One step left to become a full member"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.pendingPayment > 0
                  ? "We received your entrance fee and are confirming it (up to 24 hours)."
                  : `Pay the ${formatNaira(stats.entranceFee)} membership entrance fee to unlock investing.`}
              </p>
            </div>
            {stats.pendingPayment === 0 && (
              <Link
                to="/co-operative/fund"
                className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:mt-0"
              >
                Pay entrance fee
              </Link>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Available for investment"
            value={formatNaira(stats?.balance ?? 0)}
            hint="Credited after admin confirms your bank payment"
          />
          <KpiCard
            label="Available for withdrawal"
            value={formatNaira(stats?.withdrawable ?? 0)}
            hint="Monthly returns"
          />
          <KpiCard
            label="Pending payment"
            value={formatNaira(stats?.pendingPayment ?? 0)}
            hint="Awaiting admin confirmation"
          />
          <KpiCard label="Total invested" value={formatNaira(stats?.totalInvested ?? 0)} />
        </div>

        {/* Funding CTA for full members */}
        {stats?.entranceFeePaid && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Fund your investment account</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Transfer to the co-operative account and upload your receipt. Your investable
                balance updates once an admin confirms it.
              </p>
            </div>
            <Link
              to="/co-operative/fund"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:mt-0"
            >
              Make a payment
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-numeric text-2xl font-bold">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
