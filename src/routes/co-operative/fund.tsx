import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getCoopFundInfoFn, submitCoopPaymentFn } from "@/lib/api/coop-payments.functions";
import { formatNaira } from "@/lib/format";
import type { ManualPaymentPurpose, ManualPaymentStatus } from "@/lib/types";

export const Route = createFileRoute("/co-operative/fund")({
  loader: async () => {
    const result = await getCoopFundInfoFn();
    return result;
  },
  head: () => ({ meta: [{ title: "Make a payment — GText Co-operative" }] }),
  component: FundPage,
});

const inputClass = "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function FundPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if ("error" in data) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {data.error}
          </p>
        </div>
      </main>
    );
  }

  const isEntranceFee = data.membershipStatus === "payment_pending";
  const purpose: ManualPaymentPurpose = isEntranceFee ? "entrance_fee" : "investment_deposit";
  const pendingForPurpose = data.payments.find(
    (p) => p.purpose === purpose && p.status === "pending",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const file = form.get("receipt");
    if (!(file instanceof File) || file.size === 0) {
      setError("Upload your payment receipt");
      return;
    }
    setPending(true);
    setError(null);
    try {
      // Upload the receipt straight to Vercel Blob from the browser (bypasses the
      // serverless request-body limit); only the resulting URL goes to the server.
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/coop/upload",
      });
      const result = await submitCoopPaymentFn({
        data: {
          purpose,
          amount: Number(form.get("amount")),
          payerAccountName: String(form.get("payerAccountName") ?? ""),
          payerBankName: String(form.get("payerBankName") ?? ""),
          transferReference: String(form.get("transferReference") ?? "") || undefined,
          transferDate: String(form.get("transferDate") ?? "") || undefined,
          receiptUrl: blob.url,
        },
      });
      if (result && "error" in result) {
        const msg = result.error ?? "Could not submit payment.";
        setError(msg);
        toast.error(msg);
      } else {
        toast.success("Payment submitted. We'll confirm it within 24 hours.");
        formEl.reset();
        await router.invalidate();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not submit payment. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <SectionHeader
          eyebrow={isEntranceFee ? "Membership entrance fee" : "Fund your account"}
          title={isEntranceFee ? "Pay your ₦10,000 entrance fee." : "Add funds for investment."}
          sub={
            isEntranceFee
              ? "Transfer the entrance fee to the account below, then upload your receipt. Confirmation can take up to 24 hours."
              : "Transfer to the account below, then upload your receipt. Your balance updates once an admin confirms it (up to 24 hours)."
          }
        />

        {/* Bank details */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">GText Farms bank details</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="Account name" value={data.bank.accountName} />
            <Detail label="Bank" value={data.bank.bankName} />
            <Detail label="Account number" value={data.bank.accountNumber} mono />
            {data.paymentReference && (
              <Detail label="Use reference" value={data.paymentReference} mono />
            )}
            {isEntranceFee && (
              <Detail label="Amount" value={formatNaira(data.entranceFee)} numeric />
            )}
          </dl>
        </div>

        {pendingForPurpose ? (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-900">Awaiting confirmation</h3>
            <p className="mt-2 text-sm text-amber-800">
              We received your payment of {formatNaira(pendingForPurpose.amount)} and are confirming
              it. This can take up to 24 hours — we&apos;ll email you once it&apos;s approved.
            </p>
          </div>
        ) : (
          <form
            className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
            onSubmit={onSubmit}
          >
            <h3 className="text-sm font-semibold">Confirm your payment</h3>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="payerAccountName" className="text-sm font-medium">
                Name on the account you paid from
              </label>
              <input
                id="payerAccountName"
                name="payerAccountName"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="payerBankName" className="text-sm font-medium">
                Bank you paid from
              </label>
              <input id="payerBankName" name="payerBankName" required className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount paid (₦)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                  required
                  readOnly={isEntranceFee}
                  defaultValue={isEntranceFee ? data.entranceFee : undefined}
                  className={`${inputClass} ${isEntranceFee ? "bg-muted/40" : ""}`}
                />
              </div>
              <div>
                <label htmlFor="transferDate" className="text-sm font-medium">
                  Transfer date (optional)
                </label>
                <input id="transferDate" name="transferDate" type="date" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="transferReference" className="text-sm font-medium">
                Transfer reference (optional)
              </label>
              <input id="transferReference" name="transferReference" className={inputClass} />
            </div>
            <div>
              <label htmlFor="receipt" className="text-sm font-medium">
                Upload payment receipt
              </label>
              <input
                id="receipt"
                name="receipt"
                type="file"
                required
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm`}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WEBP, or PDF — up to 8 MB.
              </p>
            </div>
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Payment confirmation can take up to 24 hours. You&apos;ll be notified by email once an
              administrator confirms it.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit payment"}
            </button>
          </form>
        )}

        {/* Payment history */}
        {data.payments.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold">Payment history</h3>
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
              {data.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <div>
                    <p className="font-numeric font-semibold">{formatNaira(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.purpose === "entrance_fee" ? "Entrance fee" : "Investment funding"} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({
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
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={`mt-0.5 font-medium ${mono ? "font-mono" : ""} ${numeric ? "font-numeric font-semibold" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: ManualPaymentStatus }) {
  const styles: Record<ManualPaymentStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-forest/10 text-forest-deep",
    rejected: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
