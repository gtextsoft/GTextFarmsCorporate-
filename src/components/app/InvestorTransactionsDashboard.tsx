import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  TXN_TYPE_LABELS,
  TXN_TYPE_LABELS_LONG,
  type TransactionRow,
  type TxnStatusFilter,
  type TxnTypeFilter,
  computeTxnStats,
  countByType,
  filterTransactions,
  formatTxnDate,
  isCreditTxn,
  txnIcon,
} from "@/lib/transaction-display";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "amount_high" | "amount_low";

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

function sortTransactions(transactions: TransactionRow[], sort: SortOption) {
  const sorted = [...transactions];
  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "amount_high":
      return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    case "amount_low":
      return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

function exportCsv(transactions: TransactionRow[]) {
  const header = ["Date", "Type", "Amount", "Balance After", "Status", "Reference"];
  const rows = transactions.map((txn) => [
    formatTxnDate(txn.createdAt, true),
    TXN_TYPE_LABELS_LONG[txn.type] ?? txn.type,
    String(txn.amount),
    String(txn.balanceAfter),
    txn.status,
    txn.reference,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gtext-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function InvestorTransactionsDashboard({
  transactions,
}: {
  transactions: TransactionRow[];
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxnTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<TxnStatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const stats = useMemo(() => computeTxnStats(transactions), [transactions]);
  const typeCounts = useMemo(() => countByType(transactions), [transactions]);

  const filtered = useMemo(() => {
    const result = filterTransactions(transactions, { typeFilter, statusFilter, query });
    return sortTransactions(result, sort);
  }, [transactions, typeFilter, statusFilter, query, sort]);

  if (transactions.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
          <Receipt className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Deposits, investments, withdrawals, and return payouts will appear here once you start
          using your wallet.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/app/wallet">
            <Wallet className="size-4" />
            Fund your wallet
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Money in"
          value={formatNaira(stats.totalIn)}
          sub={`${stats.completedCount} completed`}
          icon={ArrowDownLeft}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
        <KpiCard
          label="Money out"
          value={formatNaira(stats.totalOut)}
          sub="Investments & withdrawals"
          icon={ArrowUpRight}
          iconClassName="bg-rose-50 text-rose-700"
        />
        <KpiCard
          label="Net flow"
          value={`${stats.netFlow >= 0 ? "+" : "−"}${formatNaira(Math.abs(stats.netFlow))}`}
          sub="Completed transactions"
          icon={Receipt}
          iconClassName="bg-sky-50 text-sky-700"
        />
        <KpiCard
          label="Total records"
          value={String(stats.count)}
          sub={
            stats.pendingCount > 0
              ? `${stats.pendingCount} pending`
              : "All transactions"
          }
          icon={Wallet}
          iconClassName="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference, type, or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TxnStatusFilter)}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[150px] rounded-xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="amount_high">Highest amount</SelectItem>
              <SelectItem value="amount_low">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TxnTypeFilter)}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {(
            [
              ["all", "All"],
              ["deposit", "Deposits"],
              ["investment", "Investments"],
              ["withdrawal", "Withdrawals"],
              ["return_payout", "Returns"],
              ["refund", "Refunds"],
            ] as const
          ).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
              {label}
              <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {typeCounts[key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bone/20 p-8 text-center">
          <p className="text-muted-foreground">No transactions match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setStatusFilter("all");
              setSort("newest");
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
                  <TableHead className="px-4">Date</TableHead>
                  <TableHead className="px-4">Type</TableHead>
                  <TableHead className="px-4">Description</TableHead>
                  <TableHead className="px-4">Amount</TableHead>
                  <TableHead className="px-4">Balance after</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4 text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((txn) => {
                  const Icon = txnIcon(txn.type);
                  const credit = isCreditTxn(txn.type, txn.amount);
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="px-4 text-muted-foreground">
                        <div>{formatTxnDate(txn.createdAt)}</div>
                        <div className="text-xs">{formatTxnDate(txn.createdAt, true).split(", ").pop()}</div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "grid size-8 place-items-center rounded-lg",
                              credit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="size-3.5" />
                          </span>
                          <span>{TXN_TYPE_LABELS[txn.type] ?? txn.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        {txn.investmentTitle ? (
                          <p className="font-medium">{txn.investmentTitle}</p>
                        ) : (
                          <p className="text-muted-foreground">—</p>
                        )}
                        <p className="font-mono text-xs text-muted-foreground">{txn.reference}</p>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-4 font-numeric font-semibold",
                          credit ? "text-forest-deep" : "text-foreground",
                        )}
                      >
                        {credit ? "+" : "−"}
                        {formatNaira(Math.abs(txn.amount))}
                      </TableCell>
                      <TableCell className="px-4 font-numeric text-muted-foreground">
                        {formatNaira(txn.balanceAfter)}
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={txn.status} />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        {txn.status === "completed" ? (
                          <Link
                            to="/app/reports/$transactionId/receipt"
                            params={{ transactionId: txn.id }}
                            className="text-sm font-medium text-forest-deep hover:underline"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filtered.map((txn) => {
              const Icon = txnIcon(txn.type);
              const credit = isCreditTxn(txn.type, txn.amount);
              return (
                <div key={txn.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-lg",
                          credit
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="font-medium">{TXN_TYPE_LABELS[txn.type] ?? txn.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTxnDate(txn.createdAt, true)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "font-numeric font-semibold",
                        credit ? "text-forest-deep" : "text-foreground",
                      )}
                    >
                      {credit ? "+" : "−"}
                      {formatNaira(Math.abs(txn.amount))}
                    </p>
                  </div>
                  {txn.investmentTitle && (
                    <p className="mt-2 text-sm text-muted-foreground">{txn.investmentTitle}</p>
                  )}
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{txn.reference}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge status={txn.status} />
                    {txn.status === "completed" && (
                      <Link
                        to="/app/reports/$transactionId/receipt"
                        params={{ transactionId: txn.id }}
                        className="text-sm font-medium text-forest-deep hover:underline"
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

      <div className="flex items-center justify-between rounded-xl border border-forest/15 bg-forest/5 px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
        <Link
          to="/app/wallet"
          className="inline-flex shrink-0 items-center gap-1 font-medium text-forest-deep hover:underline"
        >
          Manage wallet
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
