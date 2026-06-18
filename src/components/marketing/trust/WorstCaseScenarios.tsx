import type { WorstCaseScenario } from "@/lib/mock-data";

export function WorstCaseScenarios({ scenarios }: { scenarios: WorstCaseScenario[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Scenario</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Impact</th>
            <th className="px-4 py-3 font-medium">Mitigation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {scenarios.map((s) => (
            <tr key={s.scenario}>
              <td className="px-4 py-3 font-medium">{s.scenario}</td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{s.impact}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
