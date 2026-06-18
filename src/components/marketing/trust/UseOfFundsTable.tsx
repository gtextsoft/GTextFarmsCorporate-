import type { UseOfFundsItem } from "@/lib/mock-data";

export function UseOfFundsTable({
  items,
  target,
}: {
  items: UseOfFundsItem[];
  target: string;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <th className="pb-3 font-medium">Item</th>
          <th className="pb-3 text-right font-medium">Cost</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {items.map((row) => (
          <tr key={row.label}>
            <td className="py-3 text-muted-foreground">{row.label}</td>
            <td className="py-3 text-right font-medium">{row.amount}</td>
          </tr>
        ))}
        <tr className="font-semibold text-forest-deep">
          <td className="py-3">Total funding target</td>
          <td className="py-3 text-right">{target}</td>
        </tr>
      </tbody>
    </table>
  );
}
