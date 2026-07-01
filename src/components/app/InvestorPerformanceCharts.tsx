import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
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
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "var(--forest)",
  "var(--accent)",
  "var(--clay)",
  "var(--gold)",
  "var(--forest-deep)",
];

type Props = {
  data: InvestorPerformanceData;
  selectedCycleSlug?: string | null;
  compact?: boolean;
};

function ChartCard({
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-soft",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {badge && (
          <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest-deep">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function InvestorPerformanceCharts({
  data,
  selectedCycleSlug = null,
  compact = false,
}: Props) {
  const isAllView = !selectedCycleSlug;
  const visibleCycles = isAllView
    ? data.cycles
    : data.cycles.filter((c) => c.cycleSlug === selectedCycleSlug);

  const hasCharts = visibleCycles.some(
    (c) =>
      c.mortalityTrend.length > 0 ||
      c.fcrTrend.length > 0 ||
      c.eggTrend.length > 0 ||
      c.feedTrend.length > 0,
  );

  if (!hasCharts && data.portfolioAllocation.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Performance charts appear once field officers publish weekly reports for your cycles.{" "}
        <Link to="/app/activity" className="font-medium text-forest-deep hover:underline">
          View farm updates
        </Link>
      </p>
    );
  }

  const primaryCycle =
    visibleCycles.find((c) => c.mortalityTrend.length > 0) ?? visibleCycles[0];

  const allocationData = isAllView
    ? data.portfolioAllocation
    : data.portfolioAllocation.filter((a) => a.slug === selectedCycleSlug);

  const mortalityComparison = buildMortalityComparison(visibleCycles);

  return (
    <div className={compact ? "space-y-6" : "space-y-6"}>
      {allocationData.length > 0 && isAllView && (
        <ChartCard
          title="Portfolio allocation"
          subtitle="Invested capital by cycle"
          className="lg:max-w-md"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={compact ? 40 : 52}
                  outerRadius={compact ? 64 : 80}
                  paddingAngle={3}
                >
                  {allocationData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {isAllView && mortalityComparison.length > 1 && visibleCycles.length > 1 ? (
        <ChartCard
          title="Mortality comparison"
          subtitle="Weekly mortality across your cycles"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mortalityComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Mortality"]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {visibleCycles
                  .filter((c) => c.mortalityTrend.length > 0)
                  .map((cycle, index) => (
                    <Line
                      key={cycle.cycleSlug}
                      type="monotone"
                      dataKey={cycle.cycleSlug}
                      name={cycle.cycleTitle}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      ) : (
        primaryCycle &&
        primaryCycle.mortalityTrend.length > 0 && (
          <ChartCard
            title="Mortality trend"
            subtitle={`${primaryCycle.cycleTitle} · ${primaryCycle.farmName}`}
            badge={
              primaryCycle.latestMortality != null
                ? `Latest: ${primaryCycle.latestMortality}%`
                : undefined
            }
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={primaryCycle.mortalityTrend}>
                  <defs>
                    <linearGradient id="mortalityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--forest)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--forest)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Mortality"]} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--forest)"
                    strokeWidth={2}
                    fill="url(#mortalityFill)"
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )
      )}

      {!compact && (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleCycles.map((cycle) => (
            <CycleMetricCharts key={cycle.cycleSlug} cycle={cycle} showHeader={isAllView} />
          ))}
        </div>
      )}
    </div>
  );
}

function CycleMetricCharts({
  cycle,
  showHeader,
}: {
  cycle: InvestorPerformanceData["cycles"][number];
  showHeader: boolean;
}) {
  const hasMetrics =
    cycle.fcrTrend.length > 0 || cycle.eggTrend.length > 0 || cycle.feedTrend.length > 0;
  if (!hasMetrics) return null;

  return (
    <>
      {showHeader && (
        <div className="col-span-full">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {cycle.cycleTitle}
          </h3>
        </div>
      )}

      {cycle.fcrTrend.length > 0 && (
        <ChartCard title="Feed conversion (FCR)" subtitle={showHeader ? cycle.farmName : undefined}>
          <div className="h-52">
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
        </ChartCard>
      )}

      {cycle.eggTrend.length > 0 && (
        <ChartCard
          title="Egg production"
          subtitle={showHeader ? cycle.farmName : undefined}
          badge={
            cycle.latestEggCrates != null
              ? `Latest: ${cycle.latestEggCrates.toLocaleString()} crates`
              : undefined
          }
        >
          <div className="h-52">
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
        </ChartCard>
      )}

      {cycle.feedTrend.length > 0 && (
        <ChartCard
          title="Feed consumption"
          subtitle={showHeader ? cycle.farmName : undefined}
          badge={
            cycle.latestFeedKg != null
              ? `Latest: ${cycle.latestFeedKg.toLocaleString()} kg`
              : undefined
          }
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cycle.feedTrend}>
                <defs>
                  <linearGradient id={`feedFill-${cycle.cycleSlug}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--clay)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--clay)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit=" kg" />
                <Tooltip formatter={(value: number) => [`${value} kg`, "Feed"]} />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="var(--clay)"
                  strokeWidth={2}
                  fill={`url(#feedFill-${cycle.cycleSlug})`}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </>
  );
}

function buildMortalityComparison(cycles: InvestorPerformanceData["cycles"]) {
  const weekMap = new Map<string, Record<string, number | string>>();

  for (const cycle of cycles) {
    for (const point of cycle.mortalityTrend) {
      const row = weekMap.get(point.week) ?? { week: point.week };
      row[cycle.cycleSlug] = point.rate;
      weekMap.set(point.week, row);
    }
  }

  return [...weekMap.values()].sort((a, b) => {
    const weekA = parseInt(String(a.week).replace(/\D/g, ""), 10);
    const weekB = parseInt(String(b.week).replace(/\D/g, ""), 10);
    return weekA - weekB;
  });
}
