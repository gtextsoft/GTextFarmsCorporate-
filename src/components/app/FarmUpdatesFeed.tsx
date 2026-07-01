import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Egg,
  FileText,
  Layers,
  MapPin,
  Syringe,
  Wheat,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldReportView } from "@/lib/field-report-mapper";
import { cn } from "@/lib/utils";

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function relativeTime(value?: string) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function initials(name?: string) {
  if (!name) return "GF";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
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
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", iconClassName)}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function MetricChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 px-3 py-2">
      <Icon className="size-4 shrink-0 text-forest" />
      <div className="leading-tight">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-numeric text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: FieldReportView }) {
  const [lead, ...rest] = report.imageUrls;

  const metrics: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] =
    [];
  if (report.mortalityRate != null)
    metrics.push({ label: "Mortality", value: `${report.mortalityRate}%`, icon: FileText });
  if (report.fcr != null) metrics.push({ label: "FCR", value: String(report.fcr), icon: Wheat });
  if (report.birdCount != null)
    metrics.push({ label: "Birds", value: report.birdCount.toLocaleString(), icon: Layers });
  if (report.eggCount != null)
    metrics.push({
      label: "Crates",
      value: Math.round(report.eggCount / 30).toLocaleString(),
      icon: Egg,
    });
  if (report.feedConsumptionKg != null)
    metrics.push({
      label: "Feed",
      value: `${report.feedConsumptionKg.toLocaleString()} kg`,
      icon: Wheat,
    });
  if (report.vaccinationStatus)
    metrics.push({ label: "Vaccination", value: report.vaccinationStatus, icon: Syringe });

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {lead && (
        <div className="aspect-[16/7] w-full overflow-hidden bg-forest/10">
          <img src={lead} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-semibold text-forest-deep">
            Week {report.weekNumber}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {report.farmName}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDate(report.publishedAt)}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug">{report.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{report.cycleTitle}</p>

        <div className="mt-3 flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-forest/15 text-[10px] font-semibold text-forest-deep">
              {initials(report.authorName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {report.authorName || "Field officer"}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {report.body}
        </p>

        {metrics.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {metrics.map((m) => (
              <MetricChip key={m.label} label={m.label} value={m.value} icon={m.icon} />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {rest.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                loading="lazy"
                className="aspect-video w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        <Link
          to="/app/invest/opportunity/$cycleSlug"
          params={{ cycleSlug: report.cycleSlug }}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-forest-deep hover:underline"
        >
          View cycle
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function FarmUpdatesFeed({ reports }: { reports: FieldReportView[] }) {
  const [cycleFilter, setCycleFilter] = useState<string>("all");

  const cycles = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of reports) map.set(r.cycleSlug, r.cycleTitle);
    return [...map.entries()].map(([slug, title]) => ({ slug, title }));
  }, [reports]);

  const filtered = useMemo(
    () => (cycleFilter === "all" ? reports : reports.filter((r) => r.cycleSlug === cycleFilter)),
    [reports, cycleFilter],
  );

  const latest = reports[0]?.publishedAt ?? reports[0]?.createdAt;

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-deep">
            Farm transparency
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Weekly field updates
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Published reports from verified field officers for the cycles you&apos;ve invested in.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
              <Wheat className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No updates yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Field officers publish weekly reports for your cycles. Once you invest, updates will
              appear here.
            </p>
            <Link
              to="/app/invest"
              className="mt-5 inline-flex rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse opportunities
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Cycles tracked"
                value={String(cycles.length)}
                icon={Layers}
                iconClassName="bg-sky-50 text-sky-700"
              />
              <StatCard
                label="Total updates"
                value={String(reports.length)}
                icon={FileText}
                iconClassName="bg-violet-50 text-violet-700"
              />
              <StatCard
                label="Latest update"
                value={relativeTime(latest)}
                icon={CalendarDays}
                iconClassName="bg-lime/20 text-forest-deep"
              />
            </div>

            {cycles.length > 1 && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <span className="text-sm font-medium text-muted-foreground">Filter by cycle</span>
                <Select value={cycleFilter} onValueChange={setCycleFilter}>
                  <SelectTrigger className="w-[240px] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cycles</SelectItem>
                    {cycles.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-bone/20 p-8 text-center">
                <p className="text-muted-foreground">No updates for this cycle yet.</p>
                <button
                  type="button"
                  onClick={() => setCycleFilter("all")}
                  className="mt-3 text-sm font-medium text-forest-deep hover:underline"
                >
                  Show all cycles
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {filtered.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
