import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getAdminStatsFn } from "@/lib/api/admin.functions";
import { getAdminFieldReportStatsFn } from "@/lib/api/admin.reports.functions";
import { getAdminWithdrawalStatsFn } from "@/lib/api/admin.withdrawals.functions";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [stats, withdrawalStats, reportStats] = await Promise.all([
      getAdminStatsFn(),
      getAdminWithdrawalStatsFn(),
      getAdminFieldReportStatsFn(),
    ]);
    if ("error" in stats) return null;
    return {
      ...stats,
      pendingWithdrawals:
        withdrawalStats && !("error" in withdrawalStats)
          ? withdrawalStats.pendingWithdrawals
          : 0,
      pendingReports:
        reportStats && !("error" in reportStats) ? reportStats.pendingReports : 0,
    };
  },
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const stats = Route.useLoaderData();

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="Operations overview."
          sub="Review investor KYC, manage cycles, and monitor platform health."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "KYC awaiting review", value: stats?.submittedKyc ?? "—", highlight: true },
            { label: "KYC not started", value: stats?.pendingKyc ?? "—" },
            { label: "Verified investors", value: stats?.verifiedInvestors ?? "—" },
            { label: "Total investors", value: stats?.totalInvestors ?? "—" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {card.label}
              </div>
              <div
                className={`mt-2 font-display text-3xl ${card.highlight ? "text-forest-deep" : ""}`}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {(stats?.submittedKyc ?? 0) > 0 && (
          <div className="mt-10 rounded-2xl border border-accent/40 bg-accent/10 p-6">
            <p className="font-medium">
              {stats?.submittedKyc} investor{stats?.submittedKyc === 1 ? "" : "s"} waiting for KYC
              review.
            </p>
            <Link
              to="/admin/investors"
              search={{ status: "submitted" }}
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Review now
            </Link>
          </div>
        )}

        {(stats?.pendingReports ?? 0) > 0 && (
          <div className="mt-10 rounded-2xl border border-forest/30 bg-forest/5 p-6">
            <p className="font-medium">
              {stats?.pendingReports} field report{stats?.pendingReports === 1 ? "" : "s"} awaiting
              review.
            </p>
            <Link
              to="/admin/reports"
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Review reports
            </Link>
          </div>
        )}

        {(stats?.pendingWithdrawals ?? 0) > 0 && (
          <div className="mt-10 rounded-2xl border border-forest/30 bg-forest/5 p-6">
            <p className="font-medium">
              {stats?.pendingWithdrawals} withdrawal request
              {stats?.pendingWithdrawals === 1 ? "" : "s"} awaiting approval.
            </p>
            <Link
              to="/admin/withdrawals"
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Review withdrawals
            </Link>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/admin/analytics"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            View analytics
          </Link>
          <Link
            to="/admin/farms"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Manage farms
          </Link>
          <Link
            to="/admin/cycles"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Manage cycles
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Manage products
          </Link>
          <Link
            to="/admin/gallery"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Manage gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
