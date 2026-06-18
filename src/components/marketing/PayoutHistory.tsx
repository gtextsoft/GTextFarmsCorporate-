import { BadgeCheck } from "lucide-react";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { PayoutRecord } from "@/lib/mock-data";

export function PayoutHistory({ payouts }: { payouts: PayoutRecord[] }) {
  if (payouts.length === 0) return null;

  return (
    <section id="payouts" className="scroll-mt-24 bg-bone/60 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Payout history"
          title="Every verified payout."
          sub="Capital returned and profit distributed to investors — cycle by cycle."
        />

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Cycle</th>
                <th className="hidden px-4 py-3 sm:table-cell">Investors</th>
                <th className="px-4 py-3">Capital returned</th>
                <th className="px-4 py-3">Profit paid</th>
                <th className="px-4 py-3">Date</th>
                <th className="hidden px-4 py-3 md:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {payouts.map((payout) => (
                <tr key={payout.cycleId}>
                  <td className="px-4 py-3 font-medium">{payout.cycleTitle}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {payout.investors.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{payout.capitalReturned}</td>
                  <td className="px-4 py-3 font-semibold text-forest-deep">
                    {payout.profitPaid}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payout.payoutDate}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {payout.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-forest-deep">
                        <BadgeCheck className="size-3.5" />
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
