import type { UnitEconomics } from "@/lib/mock-data";

export function UnitEconomicsTable({ economics }: { economics: UnitEconomics }) {
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-border">
        {economics.rows.map((row) => (
          <tr key={row.label}>
            <td className="py-3 text-muted-foreground">{row.label}</td>
            <td className="py-3 text-right font-medium">{row.value}</td>
          </tr>
        ))}
        <tr>
          <td className="py-3 text-muted-foreground">Revenue</td>
          <td className="py-3 text-right font-medium">{economics.revenue}</td>
        </tr>
        <tr>
          <td className="py-3 text-muted-foreground">Total costs</td>
          <td className="py-3 text-right font-medium">{economics.totalCosts}</td>
        </tr>
        <tr className="font-semibold text-forest-deep">
          <td className="py-3">Expected profit</td>
          <td className="py-3 text-right">{economics.expectedProfit}</td>
        </tr>
      </tbody>
    </table>
  );
}
