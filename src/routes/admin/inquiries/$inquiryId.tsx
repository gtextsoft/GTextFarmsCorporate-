import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getAdminInquiryFn, updateAdminInquiryFn } from "@/lib/api/admin.inquiries.functions";

export const Route = createFileRoute("/admin/inquiries/$inquiryId")({
  loader: ({ params }) => getAdminInquiryFn({ data: { id: params.inquiryId } }),
  component: AdminInquiryDetailPage,
});

function AdminInquiryDetailPage() {
  const inquiry = Route.useLoaderData();
  const [pending, setPending] = useState(false);

  if ("error" in inquiry) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{inquiry.error}</p>
        <Link to="/admin/inquiries" className="mt-4 inline-block text-sm text-forest-deep hover:underline">
          ← Back to inquiries
        </Link>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/inquiries" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to inquiries
        </Link>

        <SectionHeader eyebrow="Inquiry" title={inquiry.subject} sub="" />

        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 text-sm shadow-soft">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-medium">{inquiry.name}</p>
              <a href={`mailto:${inquiry.email}`} className="text-forest-deep hover:underline">
                {inquiry.email}
              </a>
              {inquiry.phone && <p className="text-muted-foreground">{inquiry.phone}</p>}
            </div>
            <time className="text-xs text-muted-foreground">
              {new Date(inquiry.createdAt).toLocaleString()}
            </time>
          </div>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="capitalize">Intent: {inquiry.intent}</span>
            {inquiry.productSlug && <span>Product: {inquiry.productSlug}</span>}
          </div>

          <div className="whitespace-pre-wrap border-t border-border pt-4 leading-relaxed">
            {inquiry.message}
          </div>
        </div>

        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            try {
              const result = await updateAdminInquiryFn({
                data: {
                  id: inquiry.id,
                  status: String(form.get("status")) as "new" | "read" | "replied" | "archived",
                  adminNote: String(form.get("adminNote") || ""),
                },
              });
              if ("error" in result && result.error) toast.error(result.error);
              else toast.success("Inquiry updated");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Status</span>
            <select
              name="status"
              defaultValue={inquiry.status}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            >
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Internal note</span>
            <textarea
              name="adminNote"
              rows={3}
              defaultValue={inquiry.adminNote ?? ""}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="Notes for your team (not sent to the visitor)"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </main>
  );
}
