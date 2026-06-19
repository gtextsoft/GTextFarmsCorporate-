import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getDashboardSummaryFn, getMyInvestmentsFn, getMyTransactionsFn } from "@/lib/api/wallet.functions";
import { getInvestorActivityFeedFn } from "@/lib/api/field-reports.functions";
import { getInvestorPerformanceFn } from "@/lib/api/investor.performance.functions";
import { getMyNotificationsFn } from "@/lib/api/notifications.functions";
import { InvestorPerformanceCharts } from "@/components/app/InvestorPerformanceCharts";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — GText Farms" }] }),
  loader: async () => {
    const [summary, investments, activity, transactions, notifications, performance] = await Promise.all([
      getDashboardSummaryFn(),
      getMyInvestmentsFn(),
      getInvestorActivityFeedFn(),
      getMyTransactionsFn(),
      getMyNotificationsFn(),
      getInvestorPerformanceFn(),
    ]);
    return { summary, investments, activity, transactions, notifications, performance };
  },
  component: AppDashboard,
});

function AppDashboard() {
  const { user } = useRouteContext({ from: "__root__" });
  const { summary, investments, activity, transactions, notifications, performance } = Route.useLoaderData();

  const stats =
    "error" in summary
      ? { balance: 0, totalInvested: 0, activeInvestments: 0, totalReturns: 0 }
      : summary;

  const recentInvestments = "error" in investments ? [] : investments.slice(0, 5);
  const recentActivity = "error" in activity ? [] : activity.slice(0, 3);
  const recentTransactions = "error" in transactions ? [] : transactions.slice(0, 5);
  const recentNotifications = "error" in notifications ? [] : notifications.slice(0, 5);
  const unreadCount =
    "error" in notifications ? 0 : notifications.filter((n) => !n.read).length;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Investor dashboard"
          title={`Welcome back, ${user?.fullName?.split(" ")[0] ?? "investor"}.`}
          sub="Your wallet, investments, and open opportunities in one place."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {user?.kycStatus === "verified" ? (
            <>
              <Link
                to="/opportunities"
                className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Browse opportunities
              </Link>
              <Link
                to="/app/wallet"
                className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Fund wallet
              </Link>
            </>
          ) : user?.kycStatus === "submitted" ? (
            <p className="text-sm text-muted-foreground">
              Your KYC is under review. You can invest once an admin approves your verification.
            </p>
          ) : (
            <Link
              to="/auth/kyc"
              className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Complete KYC
            </Link>
          )}
        </div>

        {user &&
          (user.kycStatus !== "verified" ||
            !user.phone ||
            !user.bankName) && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
              <p className="font-medium">Complete your profile</p>
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {user.kycStatus !== "verified" && <li>Verify your identity (KYC)</li>}
                {!user.phone && <li>Add a phone number for SMS alerts</li>}
                {!user.bankName && <li>Add bank details for withdrawals</li>}
              </ul>
              <Link
                to="/app/profile"
                className="mt-3 inline-flex text-sm font-medium text-forest-deep hover:underline"
              >
                Go to profile →
              </Link>
            </div>
          )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total invested", value: formatNaira(stats.totalInvested) },
            { label: "Active cycles", value: String(stats.activeInvestments) },
            { label: "Total returns", value: formatNaira(stats.totalReturns) },
            { label: "Wallet balance", value: formatNaira(stats.balance) },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {card.label}
              </div>
              <div className="mt-2 font-display text-3xl text-forest-deep">{card.value}</div>
            </div>
          ))}
        </div>

        {"error" in performance ? null : performance.portfolioAllocation.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl">Farm performance</h3>
              <Link
                to="/app/performance"
                className="text-sm font-medium text-forest-deep hover:underline"
              >
                Full charts
              </Link>
            </div>
            <div className="mt-4">
              <InvestorPerformanceCharts data={performance} compact />
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl">Recent transactions</h3>
              {recentTransactions.length > 0 && (
                <Link
                  to="/app/reports"
                  className="text-sm font-medium text-forest-deep hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            {recentTransactions.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No transactions yet.{" "}
                <Link to="/app/wallet" className="font-medium text-forest-deep hover:underline">
                  Fund your wallet
                </Link>
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  >
                    <div>
                      <div className="font-medium capitalize">{txn.type.replace("_", " ")}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString("en-NG")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={txn.amount >= 0 ? "font-medium text-forest-deep" : ""}>
                        {txn.amount >= 0 ? "+" : ""}
                        {formatNaira(Math.abs(txn.amount))}
                      </div>
                      {txn.status === "completed" && (
                        <Link
                          to="/app/reports/$transactionId/receipt"
                          params={{ transactionId: txn.id }}
                          className="text-xs text-forest-deep hover:underline"
                        >
                          Receipt
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-accent">({unreadCount} new)</span>
                )}
              </h3>
              {recentNotifications.length > 0 && (
                <Link
                  to="/app/notifications"
                  className="text-sm font-medium text-forest-deep hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            {recentNotifications.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Wallet and investment updates will appear here.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {recentNotifications.map((note) => (
                  <Link
                    key={note.id}
                    to={note.link ?? "/app/notifications"}
                    className={`block rounded-xl border px-4 py-3 text-sm transition hover:opacity-90 ${
                      note.read ? "border-border bg-card" : "border-forest/30 bg-forest/5"
                    }`}
                  >
                    <div className="font-medium">{note.title}</div>
                    <p className="mt-1 line-clamp-2 text-muted-foreground">{note.body}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-2xl">Recent investments</h3>
            {!("error" in investments) && investments.length > 0 && (
              <Link
                to="/app/investments"
                className="text-sm font-medium text-forest-deep hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          {recentInvestments.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No investments yet.{" "}
              <Link to="/opportunities" className="font-medium text-forest-deep hover:underline">
                Browse open cycles
              </Link>
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Cycle</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Certificate</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {recentInvestments.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-4 py-3 font-medium">{inv.cycleTitle}</td>
                      <td className="px-4 py-3">{formatNaira(inv.amount)}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                        {inv.certificateNumber}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-2xl">Latest farm updates</h3>
            {recentActivity.length > 0 && (
              <Link
                to="/app/activity"
                className="text-sm font-medium text-forest-deep hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Published field reports for your cycles will appear here.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-soft"
                >
                  <p className="text-xs text-muted-foreground">
                    Week {report.weekNumber} · {report.farmName}
                  </p>
                  <h4 className="mt-1 font-semibold">{report.title}</h4>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{report.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
