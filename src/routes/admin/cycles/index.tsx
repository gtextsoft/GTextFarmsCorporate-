import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminCyclesFn } from "@/lib/api/admin.content.functions";

export const Route = createFileRoute("/admin/cycles/")({
  loader: () => listAdminCyclesFn(),
  component: AdminCyclesPage,
});

function AdminCyclesPage() {
  const cycles = Route.useLoaderData();

  if ("error" in cycles) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{cycles.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="Cycles."
          sub="Manage funding targets, status, and publish state for investment opportunities."
        />

        <div className="mt-6">
          <Link
            to="/admin/cycles/new"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add cycle
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Cycle</th>
                <th className="hidden px-4 py-3 md:table-cell">Farm</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Funded</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {cycles.map((cycle) => (
                <tr key={cycle.slug}>
                  <td className="px-4 py-3 font-medium">{cycle.title}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {cycle.farmName}
                  </td>
                  <td className="px-4 py-3 capitalize">{cycle.status}</td>
                  <td className="px-4 py-3">{cycle.filled}%</td>
                  <td className="px-4 py-3">
                    {cycle.published !== false ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/cycles/$cycleSlug"
                      params={{ cycleSlug: cycle.slug }}
                      className="font-medium text-forest-deep hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
