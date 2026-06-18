import type { InvestmentTerms } from "@/lib/mock-data";

export function InvestmentTermsTable({ terms }: { terms: InvestmentTerms }) {
  const rows = [
    { label: "Structure", value: terms.structure },
    { label: "Lock period", value: terms.lockPeriod },
    { label: "Early withdrawal", value: terms.earlyWithdrawal },
    { label: "Secondary market", value: terms.secondaryMarket },
  ];

  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-border">
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="py-2.5 text-muted-foreground">{row.label}</td>
            <td className="py-2.5 text-right font-medium">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
