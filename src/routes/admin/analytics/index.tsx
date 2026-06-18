import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { formatNaira } from "@/lib/format";
import { getAdminAnalyticsFn } from "@/lib/api/admin.analytics.functions";

export const Route = createFileRoute("/admin/analytics/")({
  loader: () => getAdminAnalyticsFn(),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  const data = Route.useLoaderData();

  if (!data || "error" in data) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{data?.error ?? "Could not load analytics."}</p>
      </main>
    );
  }

  const mortalityChart = data.mortalityTrend.map((row, index) => ({
    name: `${row.label}`,
    mortality: row.mortalityRate,
    key: `${row.cycleTitle}-${index}`,
  }));

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <SectionHeader
          eyebrow="Admin"
          title="Platform analytics."
          sub="Funding velocity, mortality trends from published field reports, and recent audit activity."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total invested", value: formatNaira(data.totalInvested) },
            { label: "Confirmed investments", value: data.investmentCount },
            { label: "Active funding cycles", value: data.activeFundingCycles },
            {
              label: "Avg funding / day",
              value: data.avgFundingPerDay > 0 ? formatNaira(data.avgFundingPerDay) : "—",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {card.label}
              </div>
              <div className="mt-2 font-display text-2xl">{card.value}</div>
            </div>
          ))}
        </div>

        {(data.pendingWithdrawals > 0 || data.pendingReports > 0) && (
          <div className="flex flex-wrap gap-3">
            {data.pendingWithdrawals > 0 && (
              <Link
                to="/admin/withdrawals"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                {data.pendingWithdrawals} pending withdrawal
                {data.pendingWithdrawals === 1 ? "" : "s"}
              </Link>
            )}
            {data.pendingReports > 0 && (
              <Link
                to="/admin/reports"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                {data.pendingReports} report{data.pendingReports === 1 ? "" : "s"} to review
              </Link>
            )}
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Funding velocity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily raise rate for open funding cycles.
          </p>
          {data.fundingVelocity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No cycles currently funding.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Cycle</th>
                    <th className="pb-3 pr-4 font-medium">Raised</th>
                    <th className="pb-3 pr-4 font-medium">Fill</th>
                    <th className="pb-3 pr-4 font-medium">Days open</th>
                    <th className="pb-3 font-medium">Per day</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fundingVelocity.map((row) => (
                    <tr key={row.slug} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-medium">{row.title}</td>
                      <td className="py-3 pr-4">
                        {formatNaira(row.raised)}
                        {row.target > 0 ? ` / ${formatNaira(row.target)}` : ""}
                      </td>
                      <td className="py-3 pr-4">{row.fillPct}%</td>
                      <td className="py-3 pr-4">{row.daysOpen}</td>
                      <td className="py-3">{formatNaira(row.perDay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="font-semibold">Mortality trend</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Published field reports (last 8 weeks).
              </p>
            </div>
            {data.avgMortality !== null && (
              <div className="text-sm text-muted-foreground">
                Avg: <span className="font-medium text-foreground">{data.avgMortality}%</span>
              </div>
            )}
          </div>
          {mortalityChart.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No mortality data in published reports yet.
            </p>
          ) : (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mortalityChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Mortality"]} />
                  <Bar dataKey="mortality" fill="hsl(var(--forest))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Recent audit log</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin financial and compliance actions.
          </p>
          {data.recentAuditLogs.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No audit entries yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-border">
              {data.recentAuditLogs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {log.entityType}
                      {log.entityId ? ` #${log.entityId.slice(-6)}` : ""}
                    </span>
                    {log.actorEmail && (
                      <span className="ml-2 text-xs text-muted-foreground">by {log.actorEmail}</span>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
