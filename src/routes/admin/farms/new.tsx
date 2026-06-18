import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { createFarmFn, listAdminFarmsFn } from "@/lib/api/admin.content.functions";
import { imagePaths } from "@/lib/image-paths";

export const Route = createFileRoute("/admin/farms/new")({
  loader: () => listAdminFarmsFn(),
  component: AdminNewFarmPage,
});

function AdminNewFarmPage() {
  const navigate = useNavigate();
  const farms = Route.useLoaderData();
  const [pending, setPending] = useState(false);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/farms" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to farms
        </Link>
        <SectionHeader
          eyebrow="New farm"
          title="Add a farm."
          sub="Creates a draft farm in MongoDB. Publish when ready for the public site."
        />

        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            try {
              const result = await createFarmFn({
                data: {
                  slug: String(form.get("slug")),
                  name: String(form.get("name")),
                  location: String(form.get("location")),
                  state: String(form.get("state")),
                  description: String(form.get("description")),
                  heroImage: String(form.get("heroImage")) || imagePaths.farmAerial,
                  capacity: String(form.get("capacity")),
                  birdCount: String(form.get("birdCount")),
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Farm created");
                await navigate({
                  to: "/admin/farms/$farmSlug",
                  params: { farmSlug: String(form.get("slug")) },
                });
              }
            } catch {
              toast.error("Could not create farm");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Slug (URL)</span>
            <input
              name="slug"
              required
              placeholder="henhouse-farm-06"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input name="name" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Location</span>
              <input
                name="location"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">State</span>
              <input name="state" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium">Description</span>
            <textarea
              name="description"
              rows={3}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Hero image URL</span>
            <input
              name="heroImage"
              defaultValue={imagePaths.farmAerial}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" className="size-4 rounded border-border" />
            Publish immediately
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create farm"}
          </button>
        </form>

        {"error" in farms ? null : farms.length > 0 ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Existing slugs: {farms.map((f) => f.slug).join(", ")}
          </p>
        ) : null}
      </div>
    </main>
  );
}
