import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CirclePlus,
  Coins,
  Landmark,
  Lock,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initializeDepositFn, requestWithdrawalFn } from "@/lib/api/wallet.functions";
import { formatNaira } from "@/lib/format";
import type { SafeUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export type WalletSummary = {
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  totalInvested: number;
  activeInvestments: number;
  transactions: {
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    status: string;
    reference: string;
    createdAt: string;
  }[];
};

export type WithdrawalRow = {
  id: string;
  amount: number;
  status: string;
  reference: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
};

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  investment: "Investment",
  return_payout: "Return payout",
  refund: "Refund",
  fee: "Fee",
  adjustment: "Adjustment",
};

const DEPOSIT_PRESETS = [10_000, 50_000, 100_000, 500_000] as const;

type TxnFilter = "all" | "deposit" | "investment" | "withdrawal" | "return_payout";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmountInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

function parseAmountInput(value: string) {
  return Number(value.replace(/,/g, ""));
}

function txnIcon(type: string) {
  switch (type) {
    case "deposit":
    case "return_payout":
    case "refund":
      return ArrowDownLeft;
    case "withdrawal":
      return ArrowUpRight;
    case "investment":
      return CirclePlus;
    default:
      return Receipt;
  }
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClassName,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 shadow-soft",
        highlight && "border-forest/20 bg-forest/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-2 font-numeric text-xl font-bold leading-tight md:text-2xl",
              highlight ? "text-forest-deep" : "text-foreground",
            )}
          >
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

export function InvestorWalletDashboard({
  summary,
  withdrawals,
  user,
}: {
  summary: WalletSummary;
  withdrawals: WithdrawalRow[] | { error: string };
  user?: SafeUser | null;
}) {
  const [actionTab, setActionTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmount, setDepositAmount] = useState("50,000");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositPending, setDepositPending] = useState(false);
  const [withdrawPending, setWithdrawPending] = useState(false);
  const [txnFilter, setTxnFilter] = useState<TxnFilter>("all");

  const withdrawalRows = "error" in withdrawals ? [] : withdrawals;
  const pendingWithdrawal = withdrawalRows.find((w) => w.status === "pending");
  const hasBankDetails = Boolean(user?.bankName && user?.accountNumber && user?.accountName);
  const kycVerified = user?.kycStatus === "verified";

  const stats = useMemo(() => {
    const completed = summary.transactions.filter((t) => t.status === "completed");
    return {
      totalDeposits: completed
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0),
      totalReturns: completed
        .filter((t) => t.type === "return_payout")
        .reduce((sum, t) => sum + t.amount, 0),
      netWorth: summary.availableBalance + summary.totalInvested,
    };
  }, [summary]);

  const filteredTransactions = useMemo(() => {
    if (txnFilter === "all") return summary.transactions;
    if (txnFilter === "withdrawal") {
      return summary.transactions.filter((t) => t.type === "withdrawal");
    }
    return summary.transactions.filter((t) => t.type === txnFilter);
  }, [summary.transactions, txnFilter]);

  const txnCounts = useMemo(
    () => ({
      all: summary.transactions.length,
      deposit: summary.transactions.filter((t) => t.type === "deposit").length,
      investment: summary.transactions.filter((t) => t.type === "investment").length,
      withdrawal: summary.transactions.filter((t) => t.type === "withdrawal").length,
      return_payout: summary.transactions.filter((t) => t.type === "return_payout").length,
    }),
    [summary.transactions],
  );

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseAmountInput(depositAmount);
    if (!parsed || parsed < 1000) {
      toast.error("Minimum deposit is ₦1,000");
      return;
    }
    setDepositPending(true);
    try {
      const result = await initializeDepositFn({ data: { amount: parsed } });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else if ("authorizationUrl" in result && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch {
      toast.error("Could not start payment. Check Paystack configuration.");
    } finally {
      setDepositPending(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseAmountInput(withdrawAmount);
    if (!parsed || parsed < 1000) {
      toast.error("Minimum withdrawal is ₦1,000");
      return;
    }
    if (parsed > summary.availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setWithdrawPending(true);
    try {
      const result = await requestWithdrawalFn({ data: { amount: parsed } });
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Withdrawal requested — we'll process it within 48 hours");
        window.location.reload();
      }
    } catch {
      toast.error("Could not submit withdrawal request");
    } finally {
      setWithdrawPending(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Available balance"
          value={formatNaira(summary.availableBalance)}
          sub={
            summary.lockedBalance > 0
              ? `${formatNaira(summary.lockedBalance)} locked`
              : "Ready to invest or withdraw"
          }
          icon={Wallet}
          iconClassName="bg-emerald-50 text-emerald-700"
          highlight
        />
        <KpiCard
          label="Total invested"
          value={formatNaira(summary.totalInvested)}
          sub={`${summary.activeInvestments} active cycle${summary.activeInvestments === 1 ? "" : "s"}`}
          icon={Coins}
          iconClassName="bg-sky-50 text-sky-700"
        />
        <KpiCard
          label="Returns received"
          value={formatNaira(stats.totalReturns)}
          sub={
            stats.totalDeposits > 0
              ? `${formatNaira(stats.totalDeposits)} deposited`
              : "No payouts yet"
          }
          icon={TrendingUp}
          iconClassName="bg-lime/20 text-forest-deep"
        />
        <KpiCard
          label="Portfolio value"
          value={formatNaira(stats.netWorth)}
          sub="Balance + invested capital"
          icon={ShieldCheck}
          iconClassName="bg-violet-50 text-violet-700"
        />
      </div>

      {!kycVerified && (
        <div className="flex flex-col gap-3 rounded-2xl border border-forest/20 bg-forest/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Complete KYC to withdraw</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify your identity to withdraw funds. You can still deposit and invest once verified.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-xl">
            <Link to="/auth/kyc">Complete KYC</Link>
          </Button>
        </div>
      )}

      {pendingWithdrawal && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Pending withdrawal</p>
          <p className="mt-1">
            {formatNaira(pendingWithdrawal.amount)} is locked while we process your request.
            You can only have one pending withdrawal at a time.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-3">
          <Tabs value={actionTab} onValueChange={(v) => setActionTab(v as "deposit" | "withdraw")}>
            <TabsList className="mb-6 grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="deposit">Add funds</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <form onSubmit={handleDeposit}>
                <h3 className="font-semibold">Deposit via Paystack</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Secure Naira payment. Minimum ₦1,000. Funds credit instantly after confirmation.
                </p>
                <div className="mt-5">
                  <Label htmlFor="deposit-amount">Amount (₦)</Label>
                  <Input
                    id="deposit-amount"
                    type="text"
                    inputMode="numeric"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(formatAmountInput(e.target.value))}
                    className="mt-1.5 font-numeric text-lg"
                    placeholder="50,000"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEPOSIT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset.toLocaleString("en-NG"))}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:bg-secondary"
                    >
                      {formatNaira(preset)}
                    </button>
                  ))}
                </div>
                <Button
                  type="submit"
                  disabled={depositPending}
                  className="mt-5 w-full rounded-xl"
                >
                  {depositPending ? "Redirecting…" : "Pay with Paystack"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="withdraw">
              <form onSubmit={handleWithdraw}>
                <h3 className="font-semibold">Withdraw to bank</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Funds are locked until an admin approves the transfer. Processed within 48 hours.
                </p>

                {hasBankDetails ? (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-border/70 bg-bone/20 p-4">
                    <span className="grid size-9 place-items-center rounded-lg bg-forest/10 text-forest-deep">
                      <Landmark className="size-4" />
                    </span>
                    <div className="text-sm">
                      <p className="font-medium">{user?.bankName}</p>
                      <p className="text-muted-foreground">{user?.accountName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {user?.accountNumber}
                      </p>
                      <Link
                        to="/app/profile"
                        className="mt-1 inline-flex text-xs font-medium text-forest-deep hover:underline"
                      >
                        Update bank details
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border bg-bone/20 p-4 text-sm">
                    <p className="text-muted-foreground">
                      Add your bank details before withdrawing.
                    </p>
                    <Link
                      to="/app/profile"
                      className="mt-2 inline-flex font-medium text-forest-deep hover:underline"
                    >
                      Go to profile →
                    </Link>
                  </div>
                )}

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="withdraw-amount">Amount (₦)</Label>
                    <button
                      type="button"
                      onClick={() =>
                        setWithdrawAmount(summary.availableBalance.toLocaleString("en-NG"))
                      }
                      className="text-xs font-medium text-forest-deep hover:underline"
                      disabled={summary.availableBalance <= 0}
                    >
                      Withdraw max
                    </button>
                  </div>
                  <Input
                    id="withdraw-amount"
                    type="text"
                    inputMode="numeric"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(formatAmountInput(e.target.value))}
                    className="mt-1.5 max-w-xs font-numeric"
                    placeholder="10,000"
                    disabled={!kycVerified || !hasBankDetails || Boolean(pendingWithdrawal)}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Available: {formatNaira(summary.availableBalance)}
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={
                    withdrawPending ||
                    !kycVerified ||
                    !hasBankDetails ||
                    Boolean(pendingWithdrawal) ||
                    summary.availableBalance <= 0
                  }
                  className="mt-5 rounded-xl"
                >
                  {withdrawPending ? "Submitting…" : "Request withdrawal"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-semibold">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link to="/app/invest">
                  <CirclePlus className="size-4" />
                  Invest in a cycle
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link to="/app/investments">
                  <Coins className="size-4" />
                  View portfolio
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link to="/app/reports">
                  <Receipt className="size-4" />
                  All transactions
                </Link>
              </Button>
            </div>
          </div>

          {summary.lockedBalance > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
              <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <Lock className="size-4" />
              </span>
              <div className="text-sm">
                <p className="font-medium">Locked balance</p>
                <p className="font-numeric text-lg font-bold text-foreground">
                  {formatNaira(summary.lockedBalance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Held for pending withdrawal requests
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {withdrawalRows.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Withdrawal requests</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Track the status of your bank transfer requests
            </p>
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-bone/30 hover:bg-bone/30">
                  <TableHead className="px-4">Amount</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4">Bank</TableHead>
                  <TableHead className="px-4">Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-4 font-numeric font-semibold">
                      {formatNaira(row.amount)}
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {row.bankName} · {row.accountNumber}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {withdrawalRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-border/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-numeric font-semibold">{formatNaira(row.amount)}</p>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.bankName} · {row.accountNumber}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(row.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Recent transactions</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Latest wallet activity on your account
            </p>
          </div>
          <Link
            to="/app/reports"
            className="inline-flex items-center gap-1 text-sm font-medium text-forest-deep hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <Tabs value={txnFilter} onValueChange={(v) => setTxnFilter(v as TxnFilter)}>
          <div className="border-b border-border px-4 py-3">
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
              {(
                [
                  ["all", "All"],
                  ["deposit", "Deposits"],
                  ["investment", "Investments"],
                  ["withdrawal", "Withdrawals"],
                  ["return_payout", "Returns"],
                ] as const
              ).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="rounded-lg px-3 py-1.5 text-xs">
                  {label}
                  <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {txnCounts[key]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No transactions in this category yet.
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bone/30 hover:bg-bone/30">
                    <TableHead className="px-4">Type</TableHead>
                    <TableHead className="px-4">Amount</TableHead>
                    <TableHead className="px-4">Balance after</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Date</TableHead>
                    <TableHead className="px-4 text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => {
                    const Icon = txnIcon(txn.type);
                    const isCredit = txn.amount >= 0;
                    return (
                      <TableRow key={txn.id}>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "grid size-8 place-items-center rounded-lg",
                                isCredit ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                            <span>{TYPE_LABELS[txn.type] ?? txn.type}</span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "px-4 font-numeric font-semibold",
                            isCredit ? "text-forest-deep" : "text-foreground",
                          )}
                        >
                          {isCredit ? "+" : "−"}
                          {formatNaira(Math.abs(txn.amount))}
                        </TableCell>
                        <TableCell className="px-4 font-numeric text-muted-foreground">
                          {formatNaira(txn.balanceAfter)}
                        </TableCell>
                        <TableCell className="px-4">
                          <StatusBadge status={txn.status} />
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {formatDate(txn.createdAt)}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          {txn.status === "completed" && (
                            <Link
                              to="/app/reports/$transactionId/receipt"
                              params={{ transactionId: txn.id }}
                              className="text-sm font-medium text-forest-deep hover:underline"
                            >
                              Receipt
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {filteredTransactions.map((txn) => {
                const Icon = txnIcon(txn.type);
                const isCredit = txn.amount >= 0;
                return (
                  <div key={txn.id} className="rounded-xl border border-border/70 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-lg",
                            isCredit ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <div>
                          <p className="font-medium">{TYPE_LABELS[txn.type] ?? txn.type}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(txn.createdAt)}</p>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-numeric font-semibold",
                          isCredit ? "text-forest-deep" : "text-foreground",
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {formatNaira(Math.abs(txn.amount))}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <StatusBadge status={txn.status} />
                      {txn.status === "completed" && (
                        <Link
                          to="/app/reports/$transactionId/receipt"
                          params={{ transactionId: txn.id }}
                          className="text-xs font-medium text-forest-deep hover:underline"
                        >
                          Receipt
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
