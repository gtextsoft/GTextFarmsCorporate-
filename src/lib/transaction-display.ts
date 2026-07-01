import {
  ArrowDownLeft,
  ArrowUpRight,
  CirclePlus,
  Receipt,
  TrendingUp,
} from "lucide-react";

export const TXN_TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  investment: "Investment",
  return_payout: "Return payout",
  refund: "Refund",
  fee: "Fee",
  adjustment: "Adjustment",
};

export const TXN_TYPE_LABELS_LONG: Record<string, string> = {
  deposit: "Wallet deposit",
  withdrawal: "Withdrawal",
  investment: "Cycle investment",
  return_payout: "Return payout",
  refund: "Refund",
  fee: "Fee",
  adjustment: "Adjustment",
};

export type TransactionRow = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  reference: string;
  externalReference?: string;
  investmentTitle?: string;
  createdAt: string;
};

export type TxnTypeFilter =
  | "all"
  | "deposit"
  | "investment"
  | "withdrawal"
  | "return_payout"
  | "refund";

export type TxnStatusFilter = "all" | "completed" | "pending" | "failed";

export function formatTxnDate(value: string, withTime = false) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function txnIcon(type: string) {
  switch (type) {
    case "deposit":
    case "return_payout":
    case "refund":
      return ArrowDownLeft;
    case "withdrawal":
      return ArrowUpRight;
    case "investment":
      return CirclePlus;
    case "fee":
      return TrendingUp;
    default:
      return Receipt;
  }
}

export function isCreditTxn(type: string, amount: number) {
  return amount >= 0;
}

export function computeTxnStats(transactions: TransactionRow[]) {
  const completed = transactions.filter((t) => t.status === "completed");
  const credits = completed.filter((t) => t.amount > 0);
  const debits = completed.filter((t) => t.amount < 0);

  return {
    totalIn: credits.reduce((sum, t) => sum + t.amount, 0),
    totalOut: debits.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    netFlow: completed.reduce((sum, t) => sum + t.amount, 0),
    count: transactions.length,
    completedCount: completed.length,
    pendingCount: transactions.filter((t) => t.status === "pending").length,
  };
}

export function filterTransactions(
  transactions: TransactionRow[],
  {
    typeFilter,
    statusFilter,
    query,
  }: {
    typeFilter: TxnTypeFilter;
    statusFilter: TxnStatusFilter;
    query: string;
  },
) {
  const q = query.trim().toLowerCase();

  return transactions.filter((txn) => {
    const matchesType =
      typeFilter === "all" ||
      txn.type === typeFilter ||
      (typeFilter === "refund" && txn.type === "refund");
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    const label = TXN_TYPE_LABELS_LONG[txn.type] ?? txn.type;
    const matchesQuery =
      !q ||
      txn.reference.toLowerCase().includes(q) ||
      txn.externalReference?.toLowerCase().includes(q) ||
      label.toLowerCase().includes(q) ||
      txn.type.toLowerCase().includes(q);

    return matchesType && matchesStatus && matchesQuery;
  });
}

export function countByType(transactions: TransactionRow[]) {
  return {
    all: transactions.length,
    deposit: transactions.filter((t) => t.type === "deposit").length,
    investment: transactions.filter((t) => t.type === "investment").length,
    withdrawal: transactions.filter((t) => t.type === "withdrawal").length,
    return_payout: transactions.filter((t) => t.type === "return_payout").length,
    refund: transactions.filter((t) => t.type === "refund").length,
  };
}
