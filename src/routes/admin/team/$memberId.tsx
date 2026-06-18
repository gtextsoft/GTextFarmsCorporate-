import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { deleteTeamMemberFn, getAdminTeamMemberFn, upsertTeamMemberFn } from "@/lib/api/admin.site.functions";

export const Route = createFileRoute("/admin/team/$memberId")({
  loader: async ({ params }) => {
    const member = await getAdminTeamMemberFn({ data: { id: params.memberId } });
    if ("error" in member) throw notFound();
    return { member };
  },
  component: AdminTeamEditPage,
});

function AdminTeamEditPage() {
  const { member } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/team" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to team
        </Link>
        <SectionHeader eyebrow="Edit member" title={member.name} sub={member.role} />
        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const credentials = String(form.get("credentials"))
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            try {
              const result = await upsertTeamMemberFn({
                data: {
                  id: member.id,
                  name: String(form.get("name")),
                  role: String(form.get("role")),
                  img: String(form.get("img")),
                  yearsExperience: Number(form.get("yearsExperience")) || 0,
                  bio: String(form.get("bio")),
                  credentials,
                  sortOrder: Number(form.get("sortOrder")) || 0,
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) toast.error(result.error);
              else toast.success("Team member updated");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input name="name" defaultValue={member.name} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Role</span>
            <input name="role" defaultValue={member.role} required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Photo URL</span>
            <input name="img" defaultValue={member.img} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Years experience</span>
            <input name="yearsExperience" type="number" defaultValue={member.yearsExperience} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Bio</span>
            <textarea name="bio" rows={3} defaultValue={member.bio} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Credentials (one per line)</span>
            <textarea name="credentials" rows={3} defaultValue={member.credentials} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={member.sortOrder} className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={member.published} className="size-4 rounded border-border" />
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
              if (!confirm(`Delete ${member.name}?`)) return;
              const result = await deleteTeamMemberFn({ data: { id: member.id } });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Deleted");
                await navigate({ to: "/admin/team" });
              }
            }}
          >
            Delete member
          </button>
        </div>
      </div>
    </main>
  );
}
