import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";

import { getInvestmentDetailFn } from "@/lib/api/wallet.functions";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/app/investments/$investmentId/certificate")({
  head: ({ params }) => ({
    meta: [{ title: `Certificate — ${params.investmentId}` }],
  }),
  loader: async ({ params }) => {
    const detail = await getInvestmentDetailFn({ data: { investmentId: params.investmentId } });
    if ("error" in detail) throw notFound();
    return detail;
  },
  component: CertificatePage,
});

function CertificatePage() {
  const investment = Route.useLoaderData();

  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const investedDate = investment.investedAt
    ? new Date(investment.investedAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <main className="min-h-screen bg-bone px-6 py-12 print:bg-white print:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link
            to="/app/investments"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to investments
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
              GText Farms
            </p>
            <h1 className="mt-4 font-display text-4xl text-forest-deep">
              Investment Certificate
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Proof of participation in a verified poultry production cycle
            </p>
          </div>

          <div className="mt-10 space-y-6 border-t border-border pt-8 text-sm">
            <Row label="Certificate no." value={investment.certificateNumber} mono />
            <Row label="Investor" value={investment.investorName} />
            <Row label="Email" value={investment.investorEmail} />
            <Row label="Cycle" value={investment.cycleTitle} />
            <Row label="Principal invested" value={formatNaira(investment.amount)} />
            <Row
              label="Projected return range"
              value={`${formatNaira(investment.expectedReturnMin)} – ${formatNaira(investment.expectedReturnMax)}`}
            />
            <Row label="Investment date" value={investedDate} />
            <Row label="Status" value={investment.status} />
          </div>

          <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            This certificate confirms the investor&apos;s participation in the named cycle on the
            GText Farms platform. Returns are projections based on farm performance and are not
            guaranteed. This document is issued electronically and is valid without a physical
            signature.
          </p>
        </article>
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${mono ? "font-mono text-xs sm:text-sm" : ""}`}>{value}</span>
    </div>
  );
}
