import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bird,
  CalendarDays,
  Check,
  CirclePlus,
  Egg,
  FileText,
  Headphones,
  Megaphone,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
  Wheat,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { FieldReportView } from "@/lib/field-report-mapper";
import type { InvestorPerformanceData } from "@/lib/api/investor.performance.functions";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

type Summary = {
  balance: number;
  totalInvested: number;
  activeInvestments: number;
  totalReturns: number;
};

type Investment = {
  id: string;
  cycleSlug: string;
  cycleTitle: string;
  amount: number;
  status: string;
  certificateNumber?: string;
  expectedReturnMin?: number;
  expectedReturnMax?: number;
  investedAt: string;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
};

type Notification = {
  id: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

type UserInfo = {
  fullName?: string;
  email?: string;
  kycStatus?: string;
  phone?: string;
  bankName?: string;
};

const STAGES = [
  "Renovation",
  "Stocking",
  "Active Growth",
  "Production",
  "Harvest",
  "Capital Return",
] as const;

const CAMERA_FEEDS = [
  { id: "main", label: "Main Pen" },
  { id: "feed", label: "Feed Store" },
  { id: "eggs", label: "Egg Collection" },
  { id: "gate", label: "Entrance Gate" },
] as const;

const QUICK_ACTIONS = [
  { label: "Invest Now", icon: CirclePlus, to: "/app/invest" as const, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Fund Wallet", icon: Wallet, to: "/app/wallet" as const, tone: "bg-sky-50 text-sky-700" },
  { label: "Withdrawal", icon: PiggyBank, to: "/app/wallet" as const, tone: "bg-violet-50 text-violet-700" },
  { label: "View Reports", icon: BarChart3, to: "/app" as const, hash: "performance" as const, tone: "bg-amber-50 text-amber-700" },
  { label: "Documents", icon: FileText, to: "/app/reports" as const, tone: "bg-rose-50 text-rose-700" },
  { label: "Contact Support", icon: Headphones, to: "/app" as const, hash: "support" as const, tone: "bg-teal-50 text-teal-700" },
] as const;

function DashboardCard({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn("rounded-2xl border border-border/70 bg-card p-5 shadow-soft", className)}
    >
      {children}
    </div>
  );
}

function StatLink({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-forest-deep hover:underline"
    >
      {label}
      <ArrowRight className="size-3" />
    </Link>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  linkLabel,
  linkTo,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  linkLabel: string;
  linkTo: string;
}) {
  return (
    <DashboardCard className="flex min-h-[148px] flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-numeric text-xl font-bold leading-tight text-foreground md:text-2xl">
            {value}
          </p>
        </div>
        <span className={cn("grid size-10 place-items-center rounded-xl", iconClassName)}>
          <Icon className="size-5" />
        </span>
      </div>
      <StatLink label={linkLabel} to={linkTo} />
    </DashboardCard>
  );
}

function stageIndexForStatus(status?: string) {
  switch (status) {
    case "confirmed":
      return 1;
    case "active":
      return 3;
    case "completed":
      return 5;
    default:
      return 0;
  }
}

function relativeTime(value?: string) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function kycLabel(status?: string) {
  switch (status) {
    case "verified":
      return "Verified";
    case "submitted":
      return "Under review";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

export function AppDashboardContent({
  user,
  stats,
  investments,
  activity,
  transactions,
  notifications,
  performance,
}: {
  user?: UserInfo;
  stats: Summary;
  investments: Investment[];
  activity: FieldReportView[];
  transactions: Transaction[];
  notifications: Notification[];
  performance: InvestorPerformanceData | { error: string };
}) {
  const primaryInv = investments.find((inv) => inv.status === "active") ?? investments[0];
  const cycleMeta = "error" in performance ? undefined : performance.cycles[0];
  const currentStage = stageIndexForStatus(primaryInv?.status);
  const eggTrend =
    "error" in performance
      ? []
      : (cycleMeta?.eggTrend.slice(-7) ?? []).map((point) => ({
          day: point.week.replace("Wk ", "Day "),
          crates: point.crates,
        }));
  const latestReport = activity[0];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalBalance = stats.balance + stats.totalInvested;
  const projectedMonthly =
    primaryInv?.expectedReturnMin && cycleMeta
      ? Math.round(primaryInv.expectedReturnMin / 18)
      : 0;

  const performanceStats = [
    {
      label: "Eggs Collected",
      value: latestReport?.eggCount ? latestReport.eggCount.toLocaleString() : "—",
      delta: latestReport ? "vs last report" : "Awaiting data",
    },
    {
      label: "Crates Produced",
      value: latestReport?.eggCount ? Math.round(latestReport.eggCount / 30).toLocaleString() : "—",
      delta: latestReport ? "vs last report" : "Awaiting data",
    },
    {
      label: "Feed Consumed",
      value: latestReport?.feedConsumptionKg
        ? `${latestReport.feedConsumptionKg.toLocaleString()} kg`
        : "—",
      delta: latestReport ? "vs last report" : "Awaiting data",
    },
    {
      label: "Mortality Rate",
      value:
        latestReport?.mortalityRate != null ? `${latestReport.mortalityRate.toFixed(1)}%` : "—",
      delta: latestReport ? "vs last report" : "Awaiting data",
    },
  ];

  const profileIncomplete =
    user &&
    (user.kycStatus !== "verified" || !user.phone || !user.bankName);

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 md:px-8">
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-lime/30 bg-lime/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime/20 text-forest-deep">
            <Megaphone className="size-5" />
          </span>
          <div>
            <p className="font-medium text-foreground">Your investor dashboard is ready</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Track wallet balance, farm investments, live performance, and field updates.
            </p>
          </div>
        </div>
        <Link
          to="/app/invest"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Browse Opportunities
        </Link>
      </div>

      {user?.kycStatus === "submitted" && (
        <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Your KYC is under review. You can invest once an admin approves your verification.
        </div>
      )}

      {user?.kycStatus !== "verified" && user?.kycStatus !== "submitted" && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-forest/20 bg-forest/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Complete KYC to start investing</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify your identity to fund your wallet and invest in open farm cycles.
            </p>
          </div>
          <Link
            to="/auth/kyc"
            className="inline-flex rounded-xl bg-forest-deep px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Complete KYC
          </Link>
        </div>
      )}

      {profileIncomplete && (
        <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm">
          <p className="font-medium">Complete your profile</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            {user?.kycStatus !== "verified" && <li>Verify your identity (KYC)</li>}
            {!user?.phone && <li>Add a phone number for SMS alerts</li>}
            {!user?.bankName && <li>Add bank details for withdrawals</li>}
          </ul>
          <Link
            to="/app/profile"
            className="mt-3 inline-flex text-sm font-medium text-forest-deep hover:underline"
          >
            Go to profile →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          label="Wallet Balance"
          value={formatNaira(stats.balance)}
          icon={Wallet}
          iconClassName="bg-emerald-50 text-emerald-700"
          linkLabel="View Balance"
          linkTo="/app/wallet"
        />
        <KpiCard
          label="Active Cycles"
          value={String(stats.activeInvestments)}
          icon={CalendarDays}
          iconClassName="bg-sky-50 text-sky-700"
          linkLabel="View Cycles"
          linkTo="/app/investments"
        />
        <KpiCard
          label="Available for Withdrawal"
          value={formatNaira(0)}
          icon={PiggyBank}
          iconClassName="bg-emerald-50 text-emerald-700"
          linkLabel="Withdraw"
          linkTo="/app/wallet"
        />
        <KpiCard
          label="Total Amount Invested"
          value={formatNaira(stats.totalInvested)}
          icon={TrendingUp}
          iconClassName="bg-sky-50 text-sky-700"
          linkLabel="View Investment"
          linkTo="/app/investments"
        />
        <KpiCard
          label="Total Portfolio Value"
          value={formatNaira(totalBalance)}
          icon={Bird}
          iconClassName="bg-rose-50 text-rose-700"
          linkLabel="View Portfolio"
          linkTo="/app/investments"
        />
        <KpiCard
          label="Monthly Profit (Projected)"
          value={formatNaira(projectedMonthly)}
          icon={BarChart3}
          iconClassName="bg-amber-50 text-amber-700"
          linkLabel="View Profit"
          linkTo="/app/performance"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <DashboardCard className="xl:col-span-5" id="investment">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">My Investment Overview</h2>
            {primaryInv ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {primaryInv.status === "active" ? "Production Stage" : primaryInv.status}
              </span>
            ) : null}
          </div>

          {primaryInv ? (
            <>
              <div className="mt-4 overflow-hidden rounded-xl bg-muted">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-forest/20 to-forest-deep/30">
                  <Egg className="size-12 text-forest-deep/50" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{primaryInv.cycleTitle}</h3>
                {cycleMeta ? (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {cycleMeta.farmName}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Amount Invested", value: formatNaira(primaryInv.amount) },
                  { label: "Certificate", value: primaryInv.certificateNumber ?? "Pending" },
                  { label: "Farm", value: cycleMeta?.farmName ?? "—" },
                  { label: "Status", value: primaryInv.status },
                  { label: "Invested On", value: new Date(primaryInv.investedAt).toLocaleDateString("en-NG") },
                  { label: "Total Returns", value: formatNaira(stats.totalReturns) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {STAGES.map((stage, index) => {
                  const done = index < currentStage;
                  const active = index === currentStage;
                  return (
                    <div
                      key={stage}
                      className={cn(
                        "flex min-w-[88px] flex-1 flex-col items-center gap-2 rounded-xl px-2 py-2 text-center",
                        active ? "bg-forest/10" : "bg-transparent",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 place-items-center rounded-full border text-[11px] font-semibold",
                          done || active
                            ? "border-forest bg-forest text-primary-foreground"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="size-3.5" /> : index + 1}
                      </span>
                      <span className="text-[10px] font-medium leading-tight text-muted-foreground">
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="font-medium">No investments yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Fund your wallet and invest in an open poultry cycle to see your overview here.
              </p>
              <Link
                to="/app/invest"
                className="mt-4 inline-flex rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Browse opportunities
              </Link>
            </div>
          )}
        </DashboardCard>

        <DashboardCard className="xl:col-span-4" id="cctv">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">View Farm Live (CCTV)</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
              <span className="size-2 rounded-full bg-destructive" />
              LIVE
            </span>
          </div>
          <div className="relative mt-4 overflow-hidden rounded-xl bg-ink">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-forest-deep to-ink text-center text-white/80">
              <div>
                <Egg className="mx-auto size-10 opacity-70" />
                <p className="mt-3 text-sm font-medium">Live farm feed</p>
                <p className="mt-1 text-xs text-white/60">
                  {cycleMeta?.farmName ?? "Connect cameras to your active farm"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CAMERA_FEEDS.map((camera, index) => (
              <button
                key={camera.id}
                type="button"
                className={cn(
                  "rounded-xl border px-2 py-3 text-left transition",
                  index === 0
                    ? "border-forest bg-forest/5"
                    : "border-border bg-secondary/30 hover:bg-secondary/60",
                )}
              >
                <div className="aspect-video rounded-lg bg-forest/15" />
                <p className="mt-2 text-[11px] font-medium">{camera.label}</p>
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard className="xl:col-span-3">
          <h2 className="text-lg font-semibold">My Investor Profile</h2>
          <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-b from-forest-deep to-forest p-4 text-primary-foreground shadow-lifted">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
                  GText Farms
                </p>
                <p className="text-xs opacity-70">Investor Account</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase">
                {kycLabel(user?.kycStatus)}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Avatar className="size-14 border-2 border-white/20">
                <AvatarFallback className="bg-lime text-sm font-bold text-forest-deep">
                  {(user?.fullName ?? "I")
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{user?.fullName ?? "Investor"}</p>
                <p className="truncate text-sm opacity-80">{user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3 border-t border-white/10 pt-3">
                <span className="opacity-70">KYC Status</span>
                <span className="font-medium">{kycLabel(user?.kycStatus)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="opacity-70">Wallet Balance</span>
                <span className="font-medium">{formatNaira(stats.balance)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="opacity-70">Active Investments</span>
                <span className="font-medium">{stats.activeInvestments}</span>
              </div>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
          >
            View Profile
            <ArrowUpRight className="size-4" />
          </Link>
        </DashboardCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <DashboardCard className="xl:col-span-5" id="performance">
          <h2 className="text-lg font-semibold">Farm Performance (This Month)</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {performanceStats.map((item) => (
              <div key={item.label} className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-numeric text-xl font-bold">{item.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{item.delta}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Egg Production Trend</h3>
              <Link to="/app/performance" className="text-xs font-medium text-forest-deep hover:underline">
                Full charts
              </Link>
            </div>
            <div className="mt-3 h-52">
              {eggTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eggTrend}>
                    <defs>
                      <linearGradient id="investorEggFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--forest)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--forest)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="crates"
                      stroke="var(--forest)"
                      fill="url(#investorEggFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  Performance charts appear once field officers publish weekly reports.
                </div>
              )}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="xl:col-span-4" id="updates">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent Farm Updates</h2>
            <Link to="/app/activity" className="text-xs font-medium text-forest-deep hover:underline">
              View All
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Published field reports for your cycles will appear here.
              </p>
            ) : (
              activity.slice(0, 4).map((report) => (
                <article
                  key={report.id}
                  className="flex gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-forest/10">
                    {report.imageUrls[0] ? (
                      <img src={report.imageUrls[0]} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <Wheat className="size-5 text-forest" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-medium text-forest-deep">
                        Production Update
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {relativeTime(report.publishedAt ?? report.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{report.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{report.body}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </DashboardCard>

        <div className="space-y-6 xl:col-span-3">
          <DashboardCard id="quick-actions">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    hash={"hash" in action ? action.hash : undefined}
                    className="rounded-xl border border-border/60 bg-card p-3 transition hover:border-forest/30 hover:shadow-soft"
                  >
                    <span className={cn("grid size-10 place-items-center rounded-xl", action.tone)}>
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-3 text-xs font-semibold leading-snug">{action.label}</p>
                  </Link>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
            <div className="mt-4 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Wallet and investment updates will appear here.
                </p>
              ) : (
                notifications.slice(0, 3).map((note) => (
                  <Link
                    key={note.id}
                    to={note.link ?? "/app/notifications"}
                    className={cn(
                      "block rounded-xl border px-3 py-2.5 text-sm transition hover:opacity-90",
                      note.read ? "border-border bg-secondary/20" : "border-forest/30 bg-forest/5",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Bell className="mt-0.5 size-4 shrink-0 text-forest" />
                      <div>
                        <div className="font-medium">{note.title}</div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{note.body}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </DashboardCard>

          <DashboardCard id="support">
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-forest/10 text-forest-deep">
                <Headphones className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Need Help?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our support team can help with KYC, wallet funding, and investments.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex rounded-xl bg-forest-deep px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <DashboardCard className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link to="/app/reports" className="text-xs font-medium text-forest-deep hover:underline">
            View All
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No transactions yet.{" "}
            <Link to="/app/wallet" className="font-medium text-forest-deep hover:underline">
              Fund your wallet
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-card">
                    <Receipt className="size-4 text-forest" />
                  </span>
                  <div>
                    <div className="font-medium capitalize">{txn.type.replace("_", " ")}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString("en-NG")}
                    </div>
                  </div>
                </div>
                <div className="font-numeric font-semibold text-forest-deep">
                  {txn.amount >= 0 ? "+" : ""}
                  {formatNaira(Math.abs(txn.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <footer className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} GText Farms Investor Portal</p>
        <div className="flex gap-4">
          <Link to="/legal/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/legal/terms" className="hover:text-foreground">
            Terms of Use
          </Link>
        </div>
      </footer>
    </div>
  );
}
