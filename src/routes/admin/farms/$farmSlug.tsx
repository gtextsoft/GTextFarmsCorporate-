import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { deleteFarmFn, getAdminFarmFn, updateFarmFn } from "@/lib/api/admin.content.functions";

export const Route = createFileRoute("/admin/farms/$farmSlug")({
  loader: async ({ params }) => {
    const farm = await getAdminFarmFn({ data: { slug: params.farmSlug } });
    if ("error" in farm) throw notFound();
    return { farm };
  },
  component: AdminFarmEditPage,
});

function AdminFarmEditPage() {
  const { farm } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/farms" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to farms
        </Link>
        <SectionHeader
          eyebrow="Edit farm"
          title={farm.name}
          sub={`${farm.location}, ${farm.state}`}
        />

        <form
          className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            try {
              const result = await updateFarmFn({
                data: {
                  slug: farm.slug,
                  name: String(form.get("name")),
                  location: String(form.get("location")),
                  state: String(form.get("state")),
                  capacity: String(form.get("capacity")),
                  description: String(form.get("description")),
                  birdCount: String(form.get("birdCount")),
                  mortality: String(form.get("mortality")),
                  fcr: String(form.get("fcr")),
                  cyclesPerYear: Number(form.get("cyclesPerYear")),
                  heroImage: String(form.get("heroImage")),
                  activeCycleSlug: String(form.get("activeCycleSlug")),
                  ownershipModel: String(form.get("ownershipModel")),
                  operatorName: String(form.get("operatorName")),
                  managerName: String(form.get("managerName")),
                  verification: {
                    farmVisited: form.get("farmVisited") === "on",
                    vetVerified: form.get("vetVerified") === "on",
                    cacVerified: form.get("cacVerified") === "on",
                    geoTagged: form.get("geoTagged") === "on",
                    lastInspection: String(form.get("lastInspection")),
                  },
                  published: form.get("published") === "on",
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Farm updated");
              }
            } catch {
              toast.error("Could not update farm");
            } finally {
              setPending(false);
            }
          }}
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold">Basic info</legend>
            <label className="block text-sm">
              <span className="font-medium">Name</span>
              <input
                name="name"
                defaultValue={farm.name}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Location</span>
                <input
                  name="location"
                  defaultValue={farm.location}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">State</span>
                <input
                  name="state"
                  defaultValue={farm.state}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Description</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={farm.description}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Hero image URL</span>
              <input
                name="heroImage"
                defaultValue={farm.heroImage}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold">Operations</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block text-sm">
                <span className="font-medium">Birds</span>
                <input
                  name="birdCount"
                  defaultValue={farm.birdCount}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Mortality</span>
                <input
                  name="mortality"
                  defaultValue={farm.mortality}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">FCR</span>
                <input
                  name="fcr"
                  defaultValue={farm.fcr}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Cycles / year</span>
                <input
                  name="cyclesPerYear"
                  type="number"
                  defaultValue={farm.cyclesPerYear}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Capacity</span>
              <input
                name="capacity"
                defaultValue={farm.capacity}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Active cycle slug</span>
              <input
                name="activeCycleSlug"
                defaultValue={farm.activeCycleSlug ?? ""}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold">Trust & ownership</legend>
            <label className="block text-sm">
              <span className="font-medium">Ownership model</span>
              <input
                name="ownershipModel"
                defaultValue={farm.ownershipModel}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Operator</span>
                <input
                  name="operatorName"
                  defaultValue={farm.operatorName}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Manager</span>
                <input
                  name="managerName"
                  defaultValue={farm.managerName}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["farmVisited", "Farm visited"],
                  ["vetVerified", "Vet verified"],
                  ["cacVerified", "CAC verified"],
                  ["geoTagged", "Geo-tagged"],
                ] as const
              ).map(([name, label]) => (
                <label key={name} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={farm.verification[name]}
                    className="size-4 rounded border-border"
                  />
                  {label}
                </label>
              ))}
            </div>
            <label className="block text-sm">
              <span className="font-medium">Last inspection</span>
              <input
                name="lastInspection"
                defaultValue={farm.verification.lastInspection}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={farm.published !== false}
              className="size-4 rounded border-border"
            />
            Published on public site
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="font-semibold text-destructive">Danger zone</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Permanently delete this farm. Fails if any cycles still reference it.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!confirm(`Delete farm "${farm.name}"? This cannot be undone.`)) return;
              const result = await deleteFarmFn({ data: { slug: farm.slug } });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Farm deleted");
                await navigate({ to: "/admin/farms" });
              }
            }}
          >
            Delete farm
          </button>
        </div>
      </div>
    </main>
  );
}
