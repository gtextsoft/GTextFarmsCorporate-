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

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <AdminPage title="Analytics" description="Platform metrics and trends.">
        <p className="text-muted-foreground">{data?.error ?? "Could not load analytics."}</p>
      </AdminPage>
    );
  }

  const mortalityChart = data.mortalityTrend.map((row, index) => ({
    name: `${row.label}`,
    mortality: row.mortalityRate,
    key: `${row.cycleTitle}-${index}`,
  }));

  return (
    <AdminPage
      title="Analytics"
      description="Funding velocity, mortality trends from published field reports, and recent audit activity."
      stats={[
        { label: "Total invested", value: formatNaira(data.totalInvested) },
        { label: "Confirmed investments", value: data.investmentCount },
        { label: "Active funding cycles", value: data.activeFundingCycles },
        {
          label: "Avg funding / day",
          value: data.avgFundingPerDay > 0 ? formatNaira(data.avgFundingPerDay) : "—",
        },
      ]}
      actions={
        (data.pendingWithdrawals > 0 || data.pendingReports > 0) && (
          <div className="flex flex-wrap gap-2">
            {data.pendingWithdrawals > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/withdrawals">
                  {data.pendingWithdrawals} pending withdrawal
                  {data.pendingWithdrawals === 1 ? "" : "s"}
                </Link>
              </Button>
            )}
            {data.pendingReports > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/reports">
                  {data.pendingReports} report{data.pendingReports === 1 ? "" : "s"} to review
                </Link>
              </Button>
            )}
          </div>
        )
      }
    >
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Funding velocity</CardTitle>
          <p className="text-sm text-muted-foreground">Daily raise rate for open funding cycles.</p>
        </CardHeader>
        <CardContent>
          {data.fundingVelocity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cycles currently funding.</p>
          ) : (
            <AdminDataTable
              data={data.fundingVelocity}
              getRowKey={(row) => row.slug}
              showSerial
              columns={[
                { id: "cycle", header: "Cycle", cell: (row) => row.title },
                {
                  id: "raised",
                  header: "Raised",
                  cell: (row) =>
                    `${formatNaira(row.raised)}${row.target > 0 ? ` / ${formatNaira(row.target)}` : ""}`,
                },
                { id: "fill", header: "Fill", cell: (row) => `${row.fillPct}%` },
                { id: "days", header: "Days open", cell: (row) => row.daysOpen },
                {
                  id: "perDay",
                  header: "Per day",
                  cell: (row) => formatNaira(row.perDay),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <CardTitle className="text-base">Mortality trend</CardTitle>
              <p className="text-sm text-muted-foreground">Published field reports (last 8 weeks).</p>
            </div>
            {data.avgMortality !== null && (
              <div className="text-sm text-muted-foreground">
                Avg: <span className="font-medium text-foreground">{data.avgMortality}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mortalityChart.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No mortality data in published reports yet.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mortalityChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Mortality"]} />
                  <Bar dataKey="mortality" fill="var(--forest)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Recent audit log</CardTitle>
            <Link to="/admin/audit" className="text-sm font-medium text-forest-deep hover:underline">
              View full log
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Admin financial and compliance actions.</p>
        </CardHeader>
        <CardContent>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit entries yet.</p>
          ) : (
            <AdminDataTable
              data={data.recentAuditLogs}
              getRowKey={(log) => log.id}
              columns={[
                {
                  id: "action",
                  header: "Action",
                  cell: (log) => <span className="font-medium">{log.action}</span>,
                },
                {
                  id: "entity",
                  header: "Entity",
                  hideOnMobile: true,
                  cell: (log) => (
                    <span className="text-muted-foreground">
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId.slice(-6)}` : ""}
                    </span>
                  ),
                },
                {
                  id: "when",
                  header: "When",
                  cell: (log) => new Date(log.createdAt).toLocaleString(),
                  className: "text-muted-foreground",
                },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
