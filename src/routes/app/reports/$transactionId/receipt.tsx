import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";

import { getTransactionDetailFn } from "@/lib/api/wallet.functions";
import { brand } from "@/lib/brand";
import { formatNaira } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  deposit: "Wallet Deposit Receipt",
  withdrawal: "Withdrawal Receipt",
  investment: "Investment Payment Receipt",
  return_payout: "Return Payout Receipt",
  refund: "Refund Receipt",
  fee: "Fee Receipt",
  adjustment: "Balance Adjustment",
};

export const Route = createFileRoute("/app/reports/$transactionId/receipt")({
  head: () => ({ meta: [{ title: `Receipt — ${brand.name}` }] }),
  loader: async ({ params }) => {
    const receipt = await getTransactionDetailFn({
      data: { transactionId: params.transactionId },
    });
    if ("error" in receipt) throw notFound();
    return receipt;
  },
  component: TransactionReceiptPage,
});

function TransactionReceiptPage() {
  const receipt = Route.useLoaderData();

  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const date = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <main className="min-h-screen bg-bone px-6 py-12 print:bg-white print:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link to="/app/reports" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to transactions
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Print / Save PDF
          </button>
        </div>

        <article className="rounded-3xl border-2 border-forest/20 bg-card p-8 shadow-lifted print:border-forest print:shadow-none md:p-12">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">
              {brand.name}
            </p>
            <h1 className="mt-4 font-display text-3xl text-forest-deep">
              {TYPE_LABELS[receipt.type] ?? "Transaction Receipt"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Official wallet transaction record</p>
          </div>

          <div className="mt-10 space-y-6 border-t border-border pt-8 text-sm">
            <Row label="Receipt reference" value={receipt.reference} mono />
            {receipt.externalReference && (
              <Row label="Payment reference" value={receipt.externalReference} mono />
            )}
            <Row label="Investor" value={receipt.investorName} />
            <Row label="Email" value={receipt.investorEmail} />
            <Row label="Transaction type" value={receipt.type.replace("_", " ")} />
            <Row
              label="Amount"
              value={`${receipt.amount >= 0 ? "+" : "−"}${formatNaira(Math.abs(receipt.amount))}`}
              numeric
            />
            <Row label="Balance after" value={formatNaira(receipt.balanceAfter)} numeric />
            {receipt.investmentTitle && <Row label="Cycle" value={receipt.investmentTitle} />}
            <Row label="Status" value={receipt.status} />
            <Row label="Date & time" value={date} />
          </div>

          <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            This receipt was generated electronically by {brand.legalName} for your records. For
            support, contact {brand.contact.investEmail}.
          </p>
        </article>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono,
  numeric,
}: {
  label: string;
  value: string;
  mono?: boolean;
  numeric?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium capitalize ${mono ? "font-mono text-xs sm:text-sm" : ""} ${numeric ? "font-numeric font-semibold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
