import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getInvestorDetailFn } from "@/lib/api/admin.functions";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/admin/investors/$investorId")({
  loader: async ({ params }) => {
    const detail = await getInvestorDetailFn({ data: { userId: params.investorId } });
    if ("error" in detail) throw notFound();
    return detail;
  },
  component: AdminInvestorDetailPage,
});

function AdminInvestorDetailPage() {
  const { investor, wallet, investments, transactions } = Route.useLoaderData();

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link to="/admin/investors" className="text-sm text-muted-foreground hover:text-foreground">
          ← All investors
        </Link>

        <SectionHeader
          eyebrow="Investor"
          title={investor.fullName}
          sub={investor.email}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Wallet balance", value: formatNaira(wallet.balance) },
            { label: "Locked (withdrawals)", value: formatNaira(wallet.lockedBalance) },
            { label: "Investments", value: String(investments.length) },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</div>
              <div className="mt-2 font-display text-2xl text-forest-deep">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft text-sm">
          <h3 className="font-semibold">Profile</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">KYC</dt>
              <dd className="capitalize font-medium">{investor.kycStatus}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{investor.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd>
                {investor.city && investor.state ? `${investor.city}, ${investor.state}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Joined</dt>
              <dd>
                {investor.createdAt
                  ? new Date(investor.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
            {investor.bankName && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Bank</dt>
                <dd>
                  {investor.bankName} · {investor.accountNumber} · {investor.accountName}
                </dd>
              </div>
            )}
            {investor.kycRejectionReason && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">KYC rejection reason</dt>
                <dd className="text-destructive">{investor.kycRejectionReason}</dd>
              </div>
            )}
          </dl>
        </div>

        <section className="mt-10">
          <h3 className="font-semibold">Investments</h3>
          {investments.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No investments yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Cycle</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {investments.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-4 py-3 font-medium">{inv.cycleTitle}</td>
                      <td className="px-4 py-3">{formatNaira(inv.amount)}</td>
                      <td className="px-4 py-3 capitalize">{inv.status}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {inv.investedAt
                          ? new Date(inv.investedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h3 className="font-semibold">Recent transactions</h3>
          {transactions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
                >
                  <span className="capitalize">{txn.type.replace("_", " ")}</span>
                  <span className={txn.amount >= 0 ? "font-medium text-forest-deep" : ""}>
                    {txn.amount >= 0 ? "+" : ""}
                    {formatNaira(Math.abs(txn.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
