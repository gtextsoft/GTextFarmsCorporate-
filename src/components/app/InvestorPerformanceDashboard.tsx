import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bird,
  CirclePlus,
  Egg,
  FileText,
  TrendingDown,
  Wheat,
} from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { InvestorPerformanceCharts } from "@/components/app/InvestorPerformanceCharts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InvestorPerformanceData } from "@/lib/api/investor.performance.functions";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-numeric text-xl font-bold leading-tight text-foreground">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className={cn("grid size-10 place-items-center rounded-xl", iconClassName)}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

export function InvestorPerformanceDashboard({ data }: { data: InvestorPerformanceData }) {
  const [selectedCycle, setSelectedCycle] = useState<string>("all");

  const hasInvestments = data.portfolioAllocation.length > 0;
  const hasReports = data.summary.totalReports > 0;

  const selectedCycleData = useMemo(
    () => (selectedCycle === "all" ? null : data.cycles.find((c) => c.cycleSlug === selectedCycle)),
    [data.cycles, selectedCycle],
  );

  if (!hasInvestments) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
          <BarChart3 className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No performance data yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Invest in a farm cycle to track mortality, feed conversion, egg production, and weekly
          field reports here.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-xl">
            <Link to="/app/invest">
              <CirclePlus className="size-4" />
              Browse opportunities
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/app/investments">View portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Capital deployed"
          value={formatNaira(summary.totalInvested)}
          sub={`${data.cycles.length} cycle${data.cycles.length === 1 ? "" : "s"}`}
          icon={BarChart3}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
        <KpiCard
          label="Active cycles"
          value={String(summary.activeCycles)}
          sub={summary.activeCycles > 0 ? "Currently running" : "None active"}
          icon={Activity}
          iconClassName="bg-sky-50 text-sky-700"
        />
        <KpiCard
          label="Avg. mortality"
          value={summary.avgMortality != null ? `${summary.avgMortality}%` : "—"}
          sub={
            summary.totalReports > 0
              ? `From ${summary.totalReports} report${summary.totalReports === 1 ? "" : "s"}`
              : "Awaiting reports"
          }
          icon={TrendingDown}
          iconClassName="bg-amber-50 text-amber-700"
        />
        <KpiCard
          label="Latest egg output"
          value={
            summary.latestEggCrates != null
              ? `${summary.latestEggCrates.toLocaleString()} crates`
              : "—"
          }
          sub={
            summary.latestReportDate
              ? `Updated ${formatDate(summary.latestReportDate)}`
              : "No reports yet"
          }
          icon={Egg}
          iconClassName="bg-lime/20 text-forest-deep"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={selectedCycle} onValueChange={setSelectedCycle}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
            <TabsTrigger value="all" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
              All cycles
            </TabsTrigger>
            {data.cycles.map((cycle) => (
              <TabsTrigger
                key={cycle.cycleSlug}
                value={cycle.cycleSlug}
                className="rounded-lg px-3 py-1.5 text-xs sm:text-sm"
              >
                {cycle.cycleTitle.length > 24
                  ? `${cycle.cycleTitle.slice(0, 24)}…`
                  : cycle.cycleTitle}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/app/activity">
              <FileText className="size-4" />
              Field reports
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/app/investments">Portfolio</Link>
          </Button>
        </div>
      </div>

      {selectedCycleData && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricPill
            label="Farm"
            value={selectedCycleData.farmName}
            sub={selectedCycleData.location || undefined}
          />
          <MetricPill
            label="Bird count"
            value={
              selectedCycleData.latestBirdCount != null
                ? selectedCycleData.latestBirdCount.toLocaleString()
                : "—"
            }
            icon={Bird}
          />
          <MetricPill
            label="Feed consumed"
            value={
              selectedCycleData.latestFeedKg != null
                ? `${selectedCycleData.latestFeedKg.toLocaleString()} kg`
                : "—"
            }
            icon={Wheat}
          />
          <MetricPill
            label="FCR"
            value={
              selectedCycleData.latestFcr != null ? String(selectedCycleData.latestFcr) : "—"
            }
          />
        </div>
      )}

      {!hasReports ? (
        <div className="rounded-2xl border border-dashed border-border bg-bone/20 p-8 text-center">
          <p className="text-muted-foreground">
            Performance charts appear once field officers publish weekly reports for your cycles.
          </p>
          <Link
            to="/app/activity"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-forest-deep hover:underline"
          >
            Check for farm updates
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <InvestorPerformanceCharts
          data={data}
          selectedCycleSlug={selectedCycle === "all" ? null : selectedCycle}
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Cycle performance summary</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest metrics from published field reports
          </p>
        </div>
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-bone/30 hover:bg-bone/30">
                <TableHead className="px-4">Cycle</TableHead>
                <TableHead className="px-4">Invested</TableHead>
                <TableHead className="px-4">Reports</TableHead>
                <TableHead className="px-4">Mortality</TableHead>
                <TableHead className="px-4">FCR</TableHead>
                <TableHead className="px-4">Eggs</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.cycles.map((cycle) => (
                <TableRow key={cycle.cycleSlug}>
                  <TableCell className="px-4 py-4">
                    <p className="font-medium">{cycle.cycleTitle}</p>
                    <p className="text-xs text-muted-foreground">{cycle.farmName}</p>
                  </TableCell>
                  <TableCell className="px-4 font-numeric">
                    {formatNaira(cycle.investedAmount)}
                  </TableCell>
                  <TableCell className="px-4">{cycle.reportCount}</TableCell>
                  <TableCell className="px-4 font-numeric">
                    {cycle.latestMortality != null ? `${cycle.latestMortality}%` : "—"}
                  </TableCell>
                  <TableCell className="px-4 font-numeric">{cycle.latestFcr ?? "—"}</TableCell>
                  <TableCell className="px-4 font-numeric">
                    {cycle.latestEggCrates != null
                      ? `${cycle.latestEggCrates.toLocaleString()} crates`
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={cycle.status} />
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Link
                      to="/app/invest/opportunity/$cycleSlug"
                      params={{ cycleSlug: cycle.cycleSlug }}
                      className="text-sm font-medium text-forest-deep hover:underline"
                    >
                      View cycle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {data.cycles.map((cycle) => (
            <div
              key={cycle.cycleSlug}
              className="rounded-xl border border-border/70 bg-bone/10 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{cycle.cycleTitle}</p>
                  <p className="text-xs text-muted-foreground">{cycle.farmName}</p>
                </div>
                <StatusBadge status={cycle.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Invested</dt>
                  <dd className="font-numeric font-medium">
                    {formatNaira(cycle.investedAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Reports</dt>
                  <dd>{cycle.reportCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Mortality</dt>
                  <dd className="font-numeric">
                    {cycle.latestMortality != null ? `${cycle.latestMortality}%` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">FCR</dt>
                  <dd className="font-numeric">{cycle.latestFcr ?? "—"}</dd>
                </div>
              </dl>
              <Link
                to="/app/invest/opportunity/$cycleSlug"
                params={{ cycleSlug: cycle.cycleSlug }}
                className="mt-3 inline-flex text-sm font-medium text-forest-deep hover:underline"
              >
                View cycle →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-xl border border-forest/15 bg-forest/5 px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          Metrics are sourced from verified field officer reports published weekly.
        </p>
        <Link
          to="/app/activity"
          className="inline-flex shrink-0 items-center gap-1 font-medium text-forest-deep hover:underline"
        >
          Read field reports
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-soft">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-forest-deep" />}
        <p className="font-medium">{value}</p>
      </div>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
