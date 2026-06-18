import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminFarmsFn } from "@/lib/api/admin.content.functions";

export const Route = createFileRoute("/admin/farms/")({
  loader: () => listAdminFarmsFn(),
  component: AdminFarmsPage,
});

function AdminFarmsPage() {
  const farms = Route.useLoaderData();

  if ("error" in farms) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{farms.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="Farms."
          sub="Manage published farms and operational stats shown on the public site."
        />

        <div className="mt-6">
          <Link
            to="/admin/farms/new"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add farm
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Farm</th>
                <th className="hidden px-4 py-3 sm:table-cell">Location</th>
                <th className="px-4 py-3">Birds</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {farms.map((farm) => (
                <tr key={farm.slug}>
                  <td className="px-4 py-3 font-medium">{farm.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {farm.location}, {farm.state}
                  </td>
                  <td className="px-4 py-3">{farm.birdCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        farm.published !== false
                          ? "text-forest-deep"
                          : "text-muted-foreground"
                      }
                    >
                      {farm.published !== false ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/farms/$farmSlug"
                      params={{ farmSlug: farm.slug }}
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
