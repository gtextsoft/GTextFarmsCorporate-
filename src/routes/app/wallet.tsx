import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { formatNaira } from "@/lib/format";
import { getWalletSummaryFn, getMyWithdrawalsFn, initializeDepositFn, requestWithdrawalFn } from "@/lib/api/wallet.functions";

const walletSearchSchema = z.object({
  deposit: z.enum(["success", "failed"]).optional(),
});

export const Route = createFileRoute("/app/wallet")({
  validateSearch: walletSearchSchema,
  head: () => ({ meta: [{ title: "Wallet — GText Farms" }] }),
  loader: async () => {
    const [summary, withdrawals] = await Promise.all([
      getWalletSummaryFn(),
      getMyWithdrawalsFn(),
    ]);
    return { summary, withdrawals };
  },
  component: WalletPage,
});

function WalletPage() {
  const { summary, withdrawals } = Route.useLoaderData();
  const { deposit } = Route.useSearch();
  const [amount, setAmount] = useState("50000");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [withdrawPending, setWithdrawPending] = useState(false);

  useEffect(() => {
    if (deposit === "success") {
      toast.success("Deposit received — your wallet balance will update shortly.");
    } else if (deposit === "failed") {
      toast.error("Deposit was not completed. Please try again.");
    }
  }, [deposit]);

  if ("error" in summary) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-muted-foreground">{summary.error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          eyebrow="Wallet"
          title="Fund your account."
          sub="Add Naira to your GText Farms wallet via Paystack, then invest in open cycles."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Available balance
            </div>
            <div className="mt-2 font-display text-4xl text-forest-deep">
              {formatNaira(summary.availableBalance)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Total invested: {formatNaira(summary.totalInvested)}
            </p>
          </div>

          <form
            className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              const parsed = Number(amount.replace(/,/g, ""));
              if (!parsed || parsed < 1000) {
                toast.error("Minimum deposit is ₦1,000");
                return;
              }
              setPending(true);
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
                setPending(false);
              }
            }}
          >
            <h3 className="font-display text-xl">Add funds</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Secure payment via Paystack. Minimum ₦1,000.
            </p>
            <label className="mt-4 block text-sm font-medium" htmlFor="deposit-amount">
              Amount (₦)
            </label>
            <input
              id="deposit-amount"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              placeholder="50000"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[10_000, 50_000, 100_000, 500_000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-secondary"
                >
                  {formatNaira(preset)}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Redirecting…" : "Pay with Paystack"}
            </button>
          </form>

          <form
            className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const parsed = Number(withdrawAmount.replace(/,/g, ""));
              if (!parsed || parsed < 1000) {
                toast.error("Minimum withdrawal is ₦1,000");
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
            }}
          >
            <h3 className="font-display text-xl">Withdraw to bank</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Funds are locked until an admin approves the transfer.{" "}
              <Link to="/app/profile" className="text-forest-deep hover:underline">
                Bank details on profile
              </Link>
              .
            </p>
            <label className="mt-4 block text-sm font-medium" htmlFor="withdraw-amount">
              Amount (₦)
            </label>
            <input
              id="withdraw-amount"
              type="text"
              inputMode="numeric"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^\d]/g, ""))}
              className="mt-1.5 w-full max-w-xs rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              placeholder="10000"
            />
            <button
              type="submit"
              disabled={withdrawPending}
              className="mt-5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary disabled:opacity-60"
            >
              {withdrawPending ? "Submitting…" : "Request withdrawal"}
            </button>
          </form>
        </div>

        {!("error" in withdrawals) && withdrawals.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-2xl">Withdrawal requests</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Bank</th>
                    <th className="hidden px-4 py-3 md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {withdrawals.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium">{formatNaira(row.amount)}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{row.status}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {row.bankName} {row.accountNumber}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {new Date(row.createdAt).toLocaleDateString("en-NG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl">Recent transactions</h3>
            <Link
              to="/app/reports"
              className="text-sm font-medium text-forest-deep hover:underline"
            >
              All transactions
            </Link>
          </div>

          {summary.transactions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {summary.transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="px-4 py-3 capitalize">{txn.type.replace("_", " ")}</td>
                      <td
                        className={`px-4 py-3 font-medium ${txn.amount >= 0 ? "text-forest-deep" : "text-foreground"}`}
                      >
                        {txn.amount >= 0 ? "+" : ""}
                        {formatNaira(Math.abs(txn.amount))}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{txn.status}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {new Date(txn.createdAt).toLocaleDateString("en-NG")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {txn.status === "completed" && (
                          <Link
                            to="/app/reports/$transactionId/receipt"
                            params={{ transactionId: txn.id }}
                            className="text-xs font-medium text-forest-deep hover:underline"
                          >
                            Receipt
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
