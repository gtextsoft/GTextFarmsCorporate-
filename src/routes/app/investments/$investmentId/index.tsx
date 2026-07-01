import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  FileText,
  MapPin,
  TrendingUp,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { STAGES, formatDate, stageProgress } from "@/components/app/InvestmentsPortfolio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getInvestmentDetailFn } from "@/lib/api/wallet.functions";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/investments/$investmentId/")({
  head: ({ params }) => ({
    meta: [{ title: `Investment — ${params.investmentId}` }],
  }),
  loader: async ({ params }) => {
    const detail = await getInvestmentDetailFn({ data: { investmentId: params.investmentId } });
    if ("error" in detail) throw notFound();
    return detail;
  },
  component: InvestmentDetailPage,
});

function InvestmentDetailPage() {
  const inv = Route.useLoaderData();
  const progress = stageProgress(inv.status);
  const currentStageIdx = Math.max(
    0,
    Math.min(STAGES.length - 1, Math.floor((progress / 100) * (STAGES.length - 1))),
  );

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/app/investments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to portfolio
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Investment detail
            </p>
            <h1 className="mt-1 font-display text-3xl text-forest-deep">{inv.cycleTitle}</h1>
            {inv.farmName && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {inv.farmName}
                {inv.location ? ` · ${inv.location}` : ""}
              </p>
            )}
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {inv.certificateNumber}
            </p>
          </div>
          <StatusBadge status={inv.status} className="self-start text-sm" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailStat label="Principal invested" value={formatNaira(inv.amount)} />
          <DetailStat
            label="Projected return"
            value={`${formatNaira(inv.expectedReturnMin)} – ${formatNaira(inv.expectedReturnMax)}`}
          />
          <DetailStat label="Invested on" value={formatDate(inv.investedAt)} />
          <DetailStat
            label={inv.actualReturn != null ? "Actual return" : "Cycle ROI"}
            value={
              inv.actualReturn != null
                ? formatNaira(inv.actualReturn)
                : inv.roi || "—"
            }
            highlight={inv.actualReturn != null}
          />
        </div>

        {inv.status !== "cancelled" && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">Cycle progress</h2>
              <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {STAGES.map((stage, idx) => (
                <div key={stage} className="text-center">
                  <div
                    className={cn(
                      "mx-auto size-2.5 rounded-full",
                      idx <= currentStageIdx ? "bg-forest-deep" : "bg-muted",
                    )}
                  />
                  <p
                    className={cn(
                      "mt-2 text-[10px] leading-tight sm:text-xs",
                      idx <= currentStageIdx
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {stage}
                  </p>
                </div>
              ))}
            </div>
            {inv.duration && (
              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Cycle duration: {inv.duration}
              </p>
            )}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Investment details</h2>
          <dl className="mt-4 divide-y divide-border text-sm">
            <DetailRow label="Investor" value={inv.investorName} />
            <DetailRow label="Email" value={inv.investorEmail} />
            <DetailRow label="Cycle status">
              <StatusBadge status={inv.cycleStatus} />
            </DetailRow>
            <DetailRow label="Investment status">
              <StatusBadge status={inv.status} />
            </DetailRow>
            {inv.completedAt && (
              <DetailRow label="Completed on" value={formatDate(inv.completedAt)} />
            )}
          </dl>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-xl">
            <Link
              to="/app/investments/$investmentId/certificate"
              params={{ investmentId: inv.id }}
            >
              <FileText className="size-4" />
              View certificate
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link
              to="/app/invest/opportunity/$cycleSlug"
              params={{ cycleSlug: inv.cycleSlug }}
            >
              <TrendingUp className="size-4" />
              View cycle details
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/app/performance">
              <BarChart3 className="size-4" />
              Performance
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function DetailStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-numeric text-lg font-bold leading-tight",
          highlight && "text-emerald-700",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children ?? value}</dd>
    </div>
  );
}
