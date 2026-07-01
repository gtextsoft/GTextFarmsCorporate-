import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getOpportunityFn } from "@/lib/api/cycles.functions";
import { confirmInvestmentFn, getWalletSummaryFn } from "@/lib/api/wallet.functions";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/app/invest/$cycleId")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
    if (context.user.kycStatus !== "verified") {
      throw redirect({ to: "/auth/kyc" });
    }
  },
  loader: async ({ params }) => {
    const [cycleResult, wallet] = await Promise.all([
      getOpportunityFn({ data: { slug: params.cycleId } }),
      getWalletSummaryFn(),
    ]);
    if (cycleResult && typeof cycleResult === "object" && "error" in cycleResult) {
      throw redirect({ to: "/auth/sign-in" });
    }
    const cycle = cycleResult as Opportunity | null;
    if (!cycle) throw notFound();
    if ("error" in wallet) {
      return { cycle, wallet: { balance: 0, availableBalance: 0 } };
    }
    return { cycle, wallet };
  },
  component: InvestCheckoutPage,
});

type Step = "amount" | "review" | "success";

function InvestCheckoutPage() {
  const { cycleId } = Route.useParams();
  const { cycle, wallet } = Route.useLoaderData();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(String(cycle.minimumInvestmentAmount));
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    certificateNumber: string;
    amount: number;
    expectedReturnMin: number;
    expectedReturnMax: number;
  } | null>(null);

  const parsedAmount = Number(amount.replace(/,/g, ""));
  const min = cycle.minimumInvestmentAmount;
  const remaining = (cycle.targetAmount ?? 0) - (cycle.raisedAmount ?? 0);
  const roiMin = cycle.roiMin ?? 0;
  const roiMax = cycle.roiMax ?? 0;
  const expectedMin = Math.round(parsedAmount * (1 + roiMin / 100));
  const expectedMax = Math.round(parsedAmount * (1 + roiMax / 100));

  function validateAmount(): string | null {
    if (!parsedAmount || parsedAmount < min) {
      return `Minimum investment is ${formatNaira(min)}.`;
    }
    if (parsedAmount > remaining) {
      return `Only ${formatNaira(remaining)} remaining in this cycle.`;
    }
    if (parsedAmount > wallet.availableBalance) {
      return `Insufficient balance. Fund your wallet (${formatNaira(wallet.availableBalance)} available).`;
    }
    return null;
  }

  if (step === "success" && result) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="mx-auto size-12 text-forest-deep" />
          <SectionHeader
            eyebrow="Investment confirmed"
            title="You're in."
            sub={`Your ${formatNaira(result.amount)} investment in ${cycle.title} is confirmed.`}
          />
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-soft">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Certificate
            </div>
            <div className="mt-1 font-mono text-sm font-semibold">{result.certificateNumber}</div>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected return</span>
                <span className="font-numeric font-semibold">
                  {formatNaira(result.expectedReturnMin)} – {formatNaira(result.expectedReturnMax)}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/app"
            className="mt-8 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <SectionHeader
          eyebrow="Invest"
          title={cycle.title}
          sub={`${cycle.farmName} · ${cycle.roi} ROI · ${cycle.duration}`}
        />

        <div className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm">
          Wallet balance:{" "}
          <span className="font-numeric font-semibold text-forest-deep">
            {formatNaira(wallet.availableBalance)}
          </span>
          {wallet.availableBalance < min && (
            <Link to="/app/wallet" className="ml-2 font-medium text-forest-deep hover:underline">
              Fund wallet
            </Link>
          )}
        </div>

        {step === "amount" && (
          <form
            className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={(e) => {
              e.preventDefault();
              const err = validateAmount();
              if (err) {
                toast.error(err);
                return;
              }
              setStep("review");
            }}
          >
            <div>
              <label className="text-sm font-medium" htmlFor="invest-amount">
                Investment amount (₦)
              </label>
              <input
                id="invest-amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Minimum {cycle.minimumInvestment} · {formatNaira(remaining)} remaining
              </p>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Review investment
            </button>
            <Link
              to="/app/invest/opportunity/$cycleSlug"
              params={{ cycleSlug: cycleId }}
              className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Back to opportunity
              <ArrowUpRight className="size-4" />
            </Link>
          </form>
        )}

        {step === "review" && (
          <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-xl">Review & confirm</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-numeric font-semibold">{formatNaira(parsedAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Expected return</dt>
                <dd className="font-numeric font-semibold">
                  {formatNaira(expectedMin)} – {formatNaira(expectedMax)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd>{cycle.duration}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="text-muted-foreground">Balance after</dt>
                <dd className="font-numeric font-semibold">
                  {formatNaira(wallet.availableBalance - parsedAmount)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Returns are estimates, not guarantees. By confirming you accept the cycle risk
              disclosure.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("amount")}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium"
              >
                Back
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={async () => {
                  const err = validateAmount();
                  if (err) {
                    toast.error(err);
                    setStep("amount");
                    return;
                  }
                  setPending(true);
                  try {
                    const res = await confirmInvestmentFn({
                      data: { cycleSlug: cycleId, amount: parsedAmount },
                    });
                    if ("error" in res && res.error) {
                      toast.error(res.error);
                    } else if ("success" in res && res.investment) {
                      setResult({
                        certificateNumber: res.investment.certificateNumber,
                        amount: res.investment.amount,
                        expectedReturnMin: res.investment.expectedReturnMin,
                        expectedReturnMax: res.investment.expectedReturnMax,
                      });
                      setStep("success");
                    }
                  } catch {
                    toast.error("Investment failed. Please try again.");
                  } finally {
                    setPending(false);
                  }
                }}
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {pending ? "Processing…" : "Confirm investment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
