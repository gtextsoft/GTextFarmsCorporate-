import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listAdminFaqFn } from "@/lib/api/admin.site.functions";

export const Route = createFileRoute("/admin/faq/")({
  loader: () => listAdminFaqFn(),
  component: AdminFaqPage,
});

function AdminFaqPage() {
  const items = Route.useLoaderData();

  if ("error" in items) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{items.error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Admin"
          title="FAQ."
          sub="Questions shown on the landing page and /about."
        />
        <div className="mt-6">
          <Link
            to="/admin/faq/new"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add FAQ item
          </Link>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bone/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.question}</td>
                  <td className="px-4 py-3">{item.published ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/faq/$faqId"
                      params={{ faqId: item.id }}
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
