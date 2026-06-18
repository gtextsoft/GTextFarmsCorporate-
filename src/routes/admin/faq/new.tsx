import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { upsertFaqFn } from "@/lib/api/admin.site.functions";

export const Route = createFileRoute("/admin/faq/new")({
  component: AdminNewFaqPage,
});

function AdminNewFaqPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/faq" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to FAQ
        </Link>
        <SectionHeader eyebrow="New FAQ" title="Add a question." sub="" />
        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            try {
              const result = await upsertFaqFn({
                data: {
                  question: String(form.get("question")),
                  answer: String(form.get("answer")),
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("FAQ added");
                await navigate({ to: "/admin/faq" });
              }
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Question</span>
            <input name="question" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Answer</span>
            <textarea name="answer" rows={5} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={0} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked className="size-4 rounded border-border" />
            Published
          </label>
          <button type="submit" disabled={pending} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {pending ? "Saving…" : "Create FAQ"}
          </button>
        </form>
      </div>
    </main>
  );
}
