import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getMyInvestmentsFn } from "@/lib/api/wallet.functions";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/app/investments/")({
  head: () => ({ meta: [{ title: "My Investments — GText Farms" }] }),
  loader: () => getMyInvestmentsFn(),
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const investments = Route.useLoaderData();

  if ("error" in investments) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{investments.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Portfolio"
          title="My investments."
          sub="All confirmed cycle participations, expected returns, and certificates."
        />

        {investments.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">You have not invested in any cycles yet.</p>
            <Link
              to="/opportunities"
              className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Browse opportunities
            </Link>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3">Invested</th>
                  <th className="hidden px-4 py-3 md:table-cell">Expected return</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {investments.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{inv.cycleTitle}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {inv.certificateNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatNaira(inv.amount)}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {formatNaira(inv.expectedReturnMin)} – {formatNaira(inv.expectedReturnMax)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {inv.investedAt
                        ? new Date(inv.investedAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{inv.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/app/investments/$investmentId/certificate"
                        params={{ investmentId: inv.id }}
                        className="font-medium text-forest-deep hover:underline"
                      >
                        Certificate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
