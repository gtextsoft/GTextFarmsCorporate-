import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatNaira } from "@/lib/format";
import type { InvestorPerformanceData } from "@/lib/api/investor.performance.functions";

const CHART_COLORS = [
  "var(--forest)",
  "var(--accent)",
  "var(--clay)",
  "var(--gold)",
];

type Props = {
  data: InvestorPerformanceData;
  compact?: boolean;
};

export function InvestorPerformanceCharts({ data, compact = false }: Props) {
  const hasCharts =
    data.portfolioAllocation.length > 0 ||
    data.cycles.some(
      (c) => c.mortalityTrend.length > 0 || c.fcrTrend.length > 0 || c.eggTrend.length > 0,
    );

  if (!hasCharts) {
    return (
      <p className="text-sm text-muted-foreground">
        Performance charts appear once field officers publish weekly reports for your cycles.{" "}
        <Link to="/app/activity" className="font-medium text-forest-deep hover:underline">
          View farm updates
        </Link>
      </p>
    );
  }

  const primaryCycle = data.cycles.find((c) => c.mortalityTrend.length > 0) ?? data.cycles[0];

  return (
    <div className={compact ? "space-y-6" : "space-y-10"}>
      {data.portfolioAllocation.length > 1 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Portfolio allocation</h3>
          <p className="mt-1 text-sm text-muted-foreground">Invested capital by cycle</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.portfolioAllocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={compact ? 40 : 56}
                  outerRadius={compact ? 70 : 88}
                  paddingAngle={2}
                >
                  {data.portfolioAllocation.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {primaryCycle && primaryCycle.mortalityTrend.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-semibold">Mortality trend</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {primaryCycle.cycleTitle} · {primaryCycle.farmName}
              </p>
            </div>
            {primaryCycle.latestMortality != null && (
              <span className="text-sm font-medium text-forest-deep">
                Latest: {primaryCycle.latestMortality}%
              </span>
            )}
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={primaryCycle.mortalityTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Mortality"]} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--forest)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {!compact &&
        data.cycles.map((cycle) => (
          <div key={cycle.cycleSlug} className="grid gap-6 lg:grid-cols-2">
            {cycle.fcrTrend.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h3 className="font-semibold">Feed conversion (FCR)</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cycle.cycleTitle}</p>
                <div className="mt-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cycle.fcrTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                      <Tooltip />
                      <Bar dataKey="fcr" fill="var(--forest)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {cycle.eggTrend.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h3 className="font-semibold">Egg production</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cycle.cycleTitle}</p>
                <div className="mt-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cycle.eggTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [`${value} crates`, "Output"]} />
                      <Bar dataKey="crates" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>
        ))}

      {!compact && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold">Cycle summary</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="pb-2 pr-4">Cycle</th>
                  <th className="pb-2 pr-4">Invested</th>
                  <th className="pb-2 pr-4">Reports</th>
                  <th className="pb-2 pr-4">Mortality</th>
                  <th className="pb-2">FCR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.cycles.map((cycle) => (
                  <tr key={cycle.cycleSlug}>
                    <td className="py-3 pr-4 font-medium">{cycle.cycleTitle}</td>
                    <td className="py-3 pr-4">{formatNaira(cycle.investedAmount)}</td>
                    <td className="py-3 pr-4">{cycle.reportCount}</td>
                    <td className="py-3 pr-4">
                      {cycle.latestMortality != null ? `${cycle.latestMortality}%` : "—"}
                    </td>
                    <td className="py-3">{cycle.latestFcr ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
