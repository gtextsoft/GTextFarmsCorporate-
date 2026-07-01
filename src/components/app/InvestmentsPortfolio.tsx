import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CirclePlus,
  FileText,
  MoreHorizontal,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PortfolioInvestment = {
  id: string;
  cycleSlug: string;
  cycleTitle: string;
  amount: number;
  status: string;
  certificateNumber?: string;
  expectedReturnMin: number;
  expectedReturnMax: number;
  actualReturn?: number;
  investedAt: string;
  completedAt?: string;
  cycleStatus: string;
  farmName: string;
  location: string;
  duration: string;
  roi: string;
};

type StatusFilter = "all" | "active" | "confirmed" | "completed" | "cancelled";

const STAGES = [
  "Confirmed",
  "Stocking",
  "Active Growth",
  "Production",
  "Harvest",
  "Capital Return",
] as const;

function stageProgress(status: string) {
  switch (status) {
    case "confirmed":
      return 20;
    case "active":
      return 55;
    case "completed":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 10;
  }
}

function stageLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Stocking";
    case "active":
      return "Active Growth";
    case "completed":
      return "Capital Return";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function formatDate(value?: string) {
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

function InvestmentActions({ inv }: { inv: PortfolioInvestment }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/app/investments/$investmentId" params={{ investmentId: inv.id }}>
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/app/invest/opportunity/$cycleSlug"
            params={{ cycleSlug: inv.cycleSlug }}
          >
            View cycle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/app/investments/$investmentId/certificate"
            params={{ investmentId: inv.id }}
          >
            Download certificate
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/activity">Field activity</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InvestmentCard({ inv }: { inv: PortfolioInvestment }) {
  const progress = stageProgress(inv.status);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/app/investments/$investmentId"
            params={{ investmentId: inv.id }}
            className="font-semibold text-foreground hover:text-forest-deep hover:underline"
          >
            {inv.cycleTitle}
          </Link>
          {inv.farmName && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {inv.farmName}
              {inv.location ? ` · ${inv.location}` : ""}
            </p>
          )}
          <p className="mt-1 font-mono text-xs text-muted-foreground">{inv.certificateNumber}</p>
        </div>
        <StatusBadge status={inv.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Invested</p>
          <p className="font-numeric font-semibold">{formatNaira(inv.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Expected return</p>
          <p className="font-numeric text-muted-foreground">
            {formatNaira(inv.expectedReturnMin)} – {formatNaira(inv.expectedReturnMax)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Invested on</p>
          <p>{formatDate(inv.investedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Stage</p>
          <p>{stageLabel(inv.status)}</p>
        </div>
      </div>

      {inv.status !== "cancelled" && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Cycle progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {inv.actualReturn != null && inv.status === "completed" && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Actual return: </span>
          <span className="font-numeric font-semibold text-emerald-800">
            {formatNaira(inv.actualReturn)}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/app/investments/$investmentId" params={{ investmentId: inv.id }}>
            View details
          </Link>
        </Button>
        <InvestmentActions inv={inv} />
      </div>
    </div>
  );
}

export function InvestmentsPortfolio({ investments }: { investments: PortfolioInvestment[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(() => {
    const active = investments.filter((i) => ["active", "confirmed"].includes(i.status));
    const completed = investments.filter((i) => i.status === "completed");
    return {
      totalInvested: investments.reduce((sum, i) => sum + i.amount, 0),
      activeCount: active.length,
      expectedMin: active.reduce((sum, i) => sum + i.expectedReturnMin, 0),
      expectedMax: active.reduce((sum, i) => sum + i.expectedReturnMax, 0),
      actualReturns: completed.reduce((sum, i) => sum + (i.actualReturn ?? 0), 0),
      completedCount: completed.length,
    };
  }, [investments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return investments.filter((inv) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ["active", "confirmed"].includes(inv.status)) ||
        inv.status === statusFilter;
      const matchesQuery =
        !q ||
        inv.cycleTitle.toLowerCase().includes(q) ||
        inv.certificateNumber?.toLowerCase().includes(q) ||
        inv.farmName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [investments, query, statusFilter]);

  const tabCounts = useMemo(
    () => ({
      all: investments.length,
      active: investments.filter((i) => ["active", "confirmed"].includes(i.status)).length,
      confirmed: investments.filter((i) => i.status === "confirmed").length,
      completed: investments.filter((i) => i.status === "completed").length,
      cancelled: investments.filter((i) => i.status === "cancelled").length,
    }),
    [investments],
  );

  if (investments.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
          <Wallet className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No investments yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Browse open poultry cycles, review the financials, and invest directly from your wallet.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-xl">
            <Link to="/app/invest">
              <CirclePlus className="size-4" />
              Browse opportunities
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/app/wallet">Fund wallet</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total invested"
          value={formatNaira(stats.totalInvested)}
          sub={`Across ${investments.length} cycle${investments.length === 1 ? "" : "s"}`}
          icon={Wallet}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
        <KpiCard
          label="Active cycles"
          value={String(stats.activeCount)}
          sub={stats.activeCount > 0 ? "Currently running" : "None active"}
          icon={CalendarDays}
          iconClassName="bg-sky-50 text-sky-700"
        />
        <KpiCard
          label="Projected returns"
          value={`${formatNaira(stats.expectedMin)} – ${formatNaira(stats.expectedMax)}`}
          sub="On active investments"
          icon={TrendingUp}
          iconClassName="bg-lime/20 text-forest-deep"
        />
        <KpiCard
          label="Returns received"
          value={formatNaira(stats.actualReturns)}
          sub={
            stats.completedCount > 0
              ? `${stats.completedCount} completed`
              : "No payouts yet"
          }
          icon={FileText}
          iconClassName="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by cycle, farm, or certificate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
          <Link to="/app/invest">
            <CirclePlus className="size-4" />
            New investment
          </Link>
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["confirmed", "Confirmed"],
              ["completed", "Completed"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
              {label}
              <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {tabCounts[key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bone/20 p-8 text-center">
          <p className="text-muted-foreground">No investments match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="mt-3 text-sm font-medium text-forest-deep hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-bone/30 hover:bg-bone/30">
                  <TableHead className="px-4">Cycle</TableHead>
                  <TableHead className="px-4">Invested</TableHead>
                  <TableHead className="px-4">Expected return</TableHead>
                  <TableHead className="px-4">Progress</TableHead>
                  <TableHead className="px-4">Date</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="px-4 py-4">
                      <Link
                        to="/app/investments/$investmentId"
                        params={{ investmentId: inv.id }}
                        className="font-medium hover:text-forest-deep hover:underline"
                      >
                        {inv.cycleTitle}
                      </Link>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {inv.farmName}
                        {inv.location ? ` · ${inv.location}` : ""}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {inv.certificateNumber}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 font-numeric font-medium">
                      {formatNaira(inv.amount)}
                    </TableCell>
                    <TableCell className="px-4 font-numeric text-muted-foreground">
                      {inv.status === "completed" && inv.actualReturn != null ? (
                        <span className="font-medium text-emerald-700">
                          {formatNaira(inv.actualReturn)}
                        </span>
                      ) : (
                        <>
                          {formatNaira(inv.expectedReturnMin)} –{" "}
                          {formatNaira(inv.expectedReturnMax)}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      {inv.status !== "cancelled" ? (
                        <div className="min-w-[120px]">
                          <p className="mb-1 text-xs text-muted-foreground">
                            {stageLabel(inv.status)}
                          </p>
                          <Progress value={stageProgress(inv.status)} className="h-1.5" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {formatDate(inv.investedAt)}
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <InvestmentActions inv={inv} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filtered.map((inv) => (
              <InvestmentCard key={inv.id} inv={inv} />
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between rounded-xl border border-forest/15 bg-forest/5 px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          Track live farm performance and field reports for your cycles.
        </p>
        <Link
          to="/app/activity"
          className="inline-flex shrink-0 items-center gap-1 font-medium text-forest-deep hover:underline"
        >
          View activity
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export { STAGES, stageLabel, stageProgress, formatDate };
