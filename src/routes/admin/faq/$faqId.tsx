import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { deleteFaqFn, getAdminFaqFn, upsertFaqFn } from "@/lib/api/admin.site.functions";

export const Route = createFileRoute("/admin/faq/$faqId")({
  loader: async ({ params }) => {
    const item = await getAdminFaqFn({ data: { id: params.faqId } });
    if ("error" in item) throw notFound();
    return { item };
  },
  component: AdminFaqEditPage,
});

function AdminFaqEditPage() {
  const { item } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/faq" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to FAQ
        </Link>
        <SectionHeader eyebrow="Edit FAQ" title={item.question} sub="" />
        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            try {
              const result = await upsertFaqFn({
                data: {
                  id: item.id,
                  question: String(form.get("question")),
                  answer: String(form.get("answer")),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) toast.error(result.error);
              else toast.success("FAQ updated");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Question</span>
            <input name="question" defaultValue={item.question} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Answer</span>
            <textarea name="answer" rows={5} defaultValue={item.answer} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={item.sortOrder} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={item.published} className="size-4 rounded border-border" />
            Published
          </label>
          <button type="submit" disabled={pending} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <button
            type="button"
            className="rounded-full border border-destructive px-4 py-2 text-sm font-medium text-destructive"
            onClick={async () => {
              if (!confirm("Delete this FAQ item?")) return;
              const result = await deleteFaqFn({ data: { id: item.id } });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Deleted");
                await navigate({ to: "/admin/faq" });
              }
            }}
          >
            Delete FAQ
          </button>
        </div>
      </div>
    </main>
  );
}
