import { Link } from "@tanstack/react-router";
import { CalendarDays, Layers, Search, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { OpportunityCard } from "@/components/marketing/OpportunityCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNaira } from "@/lib/format";
import type { Opportunity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SortKey = "roi" | "progress" | "duration" | "newest";

const SORT_LABELS: Record<SortKey, string> = {
  roi: "Highest ROI",
  progress: "Almost funded",
  duration: "Shortest duration",
  newest: "Newest",
};

const TYPE_LABELS: Record<string, string> = {
  broiler: "Broiler",
  layer: "Layer",
  feed_mill: "Feed Mill",
  processing: "Processing",
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-numeric text-xl font-bold leading-tight text-foreground">
            {value}
          </p>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", iconClassName)}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

export function InvestBrowse({
  openCycles,
  otherCycles,
  availableBalance,
  kycStatus,
  error,
}: {
  openCycles: Opportunity[];
  otherCycles: Opportunity[];
  availableBalance: number;
  kycStatus?: string;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("roi");

  const stats = useMemo(() => {
    const bestRoi = openCycles.reduce((max, o) => Math.max(max, o.roiMax), 0);
    const minInvest = openCycles.reduce(
      (min, o) => Math.min(min, o.minimumInvestmentAmount),
      Number.POSITIVE_INFINITY,
    );
    return {
      openCount: openCycles.length,
      bestRoi,
      minInvest: Number.isFinite(minInvest) ? minInvest : 0,
    };
  }, [openCycles]);

  const availableTypes = useMemo(() => {
    const seen = new Set<string>();
    for (const o of openCycles) seen.add(o.cycleType);
    return [...seen];
  }, [openCycles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = openCycles.filter((o) => {
      const matchesType = typeFilter === "all" || o.cycleType === typeFilter;
      const matchesQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.farmName.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    const sorted = [...list];
    switch (sort) {
      case "roi":
        sorted.sort((a, b) => b.roiMax - a.roiMax);
        break;
      case "progress":
        sorted.sort((a, b) => b.filled - a.filled);
        break;
      case "duration":
        sorted.sort((a, b) => a.durationMonths - b.durationMonths);
        break;
      case "newest":
        break;
    }
    return sorted;
  }, [openCycles, query, typeFilter, sort]);

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setSort("roi");
  };

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-deep">
            Invest
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Open investment cycles
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Browse verified poultry cycles, review the financials, and invest directly from your
            wallet.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {kycStatus === "submitted" ? (
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Your KYC is under review. You can invest as soon as an admin approves your verification.
          </div>
        ) : kycStatus !== "verified" ? (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-forest/20 bg-forest/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Complete KYC to start investing</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You can browse cycles now, but identity verification is required before you can
                invest.
              </p>
            </div>
            <Link
              to="/auth/kyc"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-forest-deep px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Complete KYC
            </Link>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Available to invest"
            value={formatNaira(availableBalance)}
            sub={
              <Link to="/app/wallet" className="font-medium text-forest-deep hover:underline">
                Fund wallet →
              </Link>
            }
            icon={Wallet}
            iconClassName="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Open cycles"
            value={String(stats.openCount)}
            sub={stats.openCount > 0 ? "Accepting investments" : "None open right now"}
            icon={Layers}
            iconClassName="bg-sky-50 text-sky-700"
          />
          <StatCard
            label="Best ROI"
            value={stats.bestRoi > 0 ? `Up to ${stats.bestRoi}%` : "—"}
            sub="Projected at maturity"
            icon={TrendingUp}
            iconClassName="bg-lime/20 text-forest-deep"
          />
          <StatCard
            label="Minimum from"
            value={stats.minInvest > 0 ? formatNaira(stats.minInvest) : "—"}
            sub="Lowest entry across cycles"
            icon={CalendarDays}
            iconClassName="bg-violet-50 text-violet-700"
          />
        </div>

        {openCycles.length === 0 && otherCycles.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
              <Layers className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No cycles available yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              No investment cycles are open right now. Check back soon, or fund your wallet so
              you&apos;re ready when the next cycle opens.
            </p>
            <Link
              to="/app/wallet"
              className="mt-5 inline-flex rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Fund your wallet
            </Link>
          </div>
        ) : (
          <>
            {openCycles.length > 0 && (
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by cycle, farm, or location…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {availableTypes.length > 1 && (
                    <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                      <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
                        <TabsTrigger value="all" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                          All
                        </TabsTrigger>
                        {availableTypes.map((type) => (
                          <TabsTrigger
                            key={type}
                            value={type}
                            className="rounded-lg px-3 py-1.5 text-xs sm:text-sm"
                          >
                            {TYPE_LABELS[type] ?? type}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}

                  <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger className="w-[168px] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {SORT_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {openCycles.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Open for investment
                  <span className="ml-2 font-normal normal-case text-muted-foreground/80">
                    {filtered.length} of {openCycles.length}
                  </span>
                </h2>
                {filtered.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-border bg-bone/20 p-8 text-center">
                    <p className="text-muted-foreground">No cycles match your filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 text-sm font-medium text-forest-deep hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((o) => (
                      <OpportunityCard key={o.slug} opportunity={o} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {openCycles.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-border bg-bone/30 p-8 text-center">
                <p className="text-muted-foreground">
                  No cycles are accepting new investments at the moment.
                </p>
              </div>
            )}

            {otherCycles.length > 0 && (
              <div className="mt-14">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Other cycles
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Active or closed cycles for reference — new investments may not be available.
                </p>
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherCycles.map((o) => (
                    <OpportunityCard key={o.slug} opportunity={o} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
