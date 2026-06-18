import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminTeamFn } from "@/lib/api/admin.site.functions";

export const Route = createFileRoute("/admin/team/")({
  loader: () => listAdminTeamFn(),
  component: AdminTeamPage,
});

function AdminTeamPage() {
  const members = Route.useLoaderData();

  if ("error" in members) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{members.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="Team."
          sub="Leadership profiles on /about and the landing page."
        />
        <div className="mt-6">
          <Link
            to="/admin/team/new"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add team member
          </Link>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 sm:table-cell">Role</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-medium">{member.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{member.role}</td>
                  <td className="px-4 py-3">{member.published ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/team/$memberId"
                      params={{ memberId: member.id }}
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
