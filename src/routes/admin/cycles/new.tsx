import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { createCycleFn, listAdminFarmsFn } from "@/lib/api/admin.content.functions";
import { imagePaths } from "@/lib/image-paths";

export const Route = createFileRoute("/admin/cycles/new")({
  loader: () => listAdminFarmsFn(),
  component: AdminNewCyclePage,
});

function AdminNewCyclePage() {
  const navigate = useNavigate();
  const farms = Route.useLoaderData();
  const [pending, setPending] = useState(false);
  const farmList = "error" in farms ? [] : farms;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link to="/admin/cycles" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to cycles
        </Link>
        <SectionHeader
          eyebrow="New cycle"
          title="Add an opportunity."
          sub="Creates a draft cycle. Add trust content on the edit page before publishing."
        />

        {farmList.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Create a farm first before adding a cycle.
          </p>
        ) : (
          <form
            className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const form = new FormData(e.currentTarget);
              const farmSlug = String(form.get("farmSlug"));
              const farm = farmList.find((f) => f.slug === farmSlug);
              try {
                const result = await createCycleFn({
                  data: {
                    slug: String(form.get("slug")),
                    title: String(form.get("title")),
                    type: String(form.get("type")),
                    cycleType: String(form.get("cycleType")) as
                      | "broiler"
                      | "layer"
                      | "feed_mill"
                      | "processing",
                    farmSlug,
                    farmName: farm?.name ?? farmSlug,
                    location: String(form.get("location")),
                    img: String(form.get("img")) || imagePaths.heroFarm,
                    roi: String(form.get("roi")),
                    roiMin: Number(form.get("roiMin")),
                    roiMax: Number(form.get("roiMax")),
                    duration: String(form.get("duration")),
                    durationMonths: Number(form.get("durationMonths")),
                    risk: String(form.get("risk")) as "Low" | "Moderate" | "High",
                    targetAmount: Number(form.get("targetAmount")),
                    minimumInvestmentAmount: Number(form.get("minimumInvestmentAmount")),
                    description: String(form.get("description")),
                    published: form.get("published") === "on",
                  },
                });
                if ("error" in result && result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Cycle created");
                  await navigate({
                    to: "/admin/cycles/$cycleSlug",
                    params: { cycleSlug: String(form.get("slug")) },
                  });
                }
              } catch {
                toast.error("Could not create cycle");
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
                placeholder="ibadan-broiler-cycle-15"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Title</span>
              <input name="title" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Farm</span>
              <select
                name="farmSlug"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                defaultValue={farmList[0]?.slug}
              >
                {farmList.map((farm) => (
                  <option key={farm.slug} value={farm.slug}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Type label</span>
                <input
                  name="type"
                  required
                  defaultValue="Broiler farming"
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Cycle type</span>
                <select
                  name="cycleType"
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                >
                  <option value="broiler">Broiler</option>
                  <option value="layer">Layer</option>
                  <option value="feed_mill">Feed mill</option>
                  <option value="processing">Processing</option>
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Location (state/region)</span>
              <input name="location" required className="mt-1 w-full rounded-xl border border-border px-3 py-2" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="font-medium">ROI label</span>
                <input
                  name="roi"
                  required
                  defaultValue="12 – 18%"
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">ROI min %</span>
                <input
                  name="roiMin"
                  type="number"
                  defaultValue={12}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">ROI max %</span>
                <input
                  name="roiMax"
                  type="number"
                  defaultValue={18}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Duration</span>
                <input
                  name="duration"
                  required
                  defaultValue="6 months"
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Months</span>
                <input
                  name="durationMonths"
                  type="number"
                  defaultValue={6}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Risk</span>
              <select name="risk" className="mt-1 w-full rounded-xl border border-border px-3 py-2">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Target (₦)</span>
                <input
                  name="targetAmount"
                  type="number"
                  required
                  defaultValue={45000000}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Minimum invest (₦)</span>
                <input
                  name="minimumInvestmentAmount"
                  type="number"
                  required
                  defaultValue={50000}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" className="size-4 rounded border-border" />
              Publish immediately
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create cycle"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
