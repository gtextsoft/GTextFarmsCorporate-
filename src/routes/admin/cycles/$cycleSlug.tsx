import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { deleteCycleFn, getAdminCycleFn, updateCycleFn } from "@/lib/api/admin.content.functions";

function parseJsonField<T>(raw: string, fallback: T): T {
  if (!raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Invalid JSON in structured fields");
  }
}

export const Route = createFileRoute("/admin/cycles/$cycleSlug")({
  loader: async ({ params }) => {
    const cycle = await getAdminCycleFn({ data: { slug: params.cycleSlug } });
    if ("error" in cycle) throw notFound();
    return { cycle };
  },
  component: AdminCycleEditPage,
});

function AdminCycleEditPage() {
  const { cycle } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/cycles" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to cycles
        </Link>
        <SectionHeader
          eyebrow="Edit cycle"
          title={cycle.title}
          sub={`${cycle.farmName} · ${cycle.roi} ROI`}
        />

        <form
          className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            try {
              const result = await updateCycleFn({
                data: {
                  slug: cycle.slug,
                  title: String(form.get("title")),
                  description: String(form.get("description")),
                  type: String(form.get("type")),
                  img: String(form.get("img")),
                  location: String(form.get("location")),
                  roi: String(form.get("roi")),
                  roiMin: Number(form.get("roiMin")),
                  roiMax: Number(form.get("roiMax")),
                  duration: String(form.get("duration")),
                  durationMonths: Number(form.get("durationMonths")),
                  risk: String(form.get("risk")) as "Low" | "Moderate" | "High",
                  ownershipModel: String(form.get("ownershipModel")),
                  status: String(form.get("status")) as
                    | "funding"
                    | "active"
                    | "draft"
                    | "closed",
                  raisedAmount: Number(form.get("raisedAmount")),
                  targetAmount: Number(form.get("targetAmount")),
                  minimumInvestmentAmount: Number(form.get("minimumInvestmentAmount")),
                  published: form.get("published") === "on",
                  financials: parseJsonField(String(form.get("financialsJson")), cycle.financials),
                  useOfFunds: parseJsonField(String(form.get("useOfFundsJson")), cycle.useOfFunds),
                  unitEconomics: parseJsonField(
                    String(form.get("unitEconomicsJson")),
                    cycle.unitEconomics,
                  ),
                  investmentTerms: parseJsonField(
                    String(form.get("investmentTermsJson")),
                    cycle.investmentTerms,
                  ),
                  worstCaseScenarios: parseJsonField(
                    String(form.get("worstCaseJson")),
                    cycle.worstCaseScenarios,
                  ),
                  journal: parseJsonField(String(form.get("journalJson")), cycle.journal),
                  risks: parseJsonField(String(form.get("risksJson")), cycle.risks),
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Cycle updated");
              }
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not update cycle");
            } finally {
              setPending(false);
            }
          }}
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold">Basic info</legend>
            <label className="block text-sm">
              <span className="font-medium">Title</span>
              <input
                name="title"
                defaultValue={cycle.title}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Description</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={cycle.description}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Type label</span>
                <input
                  name="type"
                  defaultValue={cycle.type}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Location</span>
                <input
                  name="location"
                  defaultValue={cycle.location}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Image URL</span>
              <input
                name="img"
                defaultValue={cycle.img}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Ownership model</span>
              <input
                name="ownershipModel"
                defaultValue={cycle.ownershipModel}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold">Returns & funding</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="font-medium">ROI label</span>
                <input
                  name="roi"
                  defaultValue={cycle.roi}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">ROI min %</span>
                <input
                  name="roiMin"
                  type="number"
                  defaultValue={cycle.roiMin}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">ROI max %</span>
                <input
                  name="roiMax"
                  type="number"
                  defaultValue={cycle.roiMax}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Duration</span>
                <input
                  name="duration"
                  defaultValue={cycle.duration}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Duration (months)</span>
                <input
                  name="durationMonths"
                  type="number"
                  defaultValue={cycle.durationMonths}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Risk</span>
                <select
                  name="risk"
                  defaultValue={cycle.risk}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Status</span>
                <select
                  name="status"
                  defaultValue={cycle.status}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                >
                  <option value="funding">Funding</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Raised (₦)</span>
                <input
                  name="raisedAmount"
                  type="number"
                  defaultValue={cycle.raisedAmount}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Target (₦)</span>
                <input
                  name="targetAmount"
                  type="number"
                  defaultValue={cycle.targetAmount}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Minimum investment (₦)</span>
              <input
                name="minimumInvestmentAmount"
                type="number"
                defaultValue={cycle.minimumInvestmentAmount}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Currently {cycle.filled}% funded · {cycle.raised} of {cycle.target}
            </p>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold">Structured content (JSON)</legend>
            <p className="text-xs text-muted-foreground">
              Edit trust tables, journal, and financial breakdown. Must be valid JSON arrays/objects.
            </p>
            {(
              [
                ["financialsJson", "Financials", cycle.financials],
                ["useOfFundsJson", "Use of funds", cycle.useOfFunds],
                ["unitEconomicsJson", "Unit economics", cycle.unitEconomics],
                ["investmentTermsJson", "Investment terms", cycle.investmentTerms],
                ["worstCaseJson", "Worst-case scenarios", cycle.worstCaseScenarios],
                ["journalJson", "Cycle journal", cycle.journal],
                ["risksJson", "Risk bullets", cycle.risks],
              ] as const
            ).map(([name, label, value]) => (
              <label key={name} className="block text-sm">
                <span className="font-medium">{label}</span>
                <textarea
                  name={name}
                  rows={name === "risksJson" ? 4 : 6}
                  defaultValue={JSON.stringify(value, null, 2)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
                />
              </label>
            ))}
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={cycle.published !== false}
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
            Permanently delete this cycle from the database.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            onClick={async () => {
              if (!confirm(`Delete cycle "${cycle.title}"? This cannot be undone.`)) return;
              const result = await deleteCycleFn({ data: { slug: cycle.slug } });
              if ("error" in result && result.error) toast.error(result.error);
              else {
                toast.success("Cycle deleted");
                await navigate({ to: "/admin/cycles" });
              }
            }}
          >
            Delete cycle
          </button>
        </div>
      </div>
    </main>
  );
}
