import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  createFieldReportFn,
  listFieldCyclesFn,
  submitFieldReportFn,
} from "@/lib/api/field.reports.functions";

export const Route = createFileRoute("/field/reports/new")({
  loader: () => listFieldCyclesFn(),
  component: NewFieldReportPage,
});

function parseImageUrls(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function NewFieldReportPage() {
  const cycles = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [submitAfterSave, setSubmitAfterSave] = useState(false);

  const cycleList = "error" in cycles ? [] : cycles;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/field" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to reports
        </Link>
        <SectionHeader
          eyebrow="New report"
          title="Weekly field update."
          sub="Record operational data from the farm. Save as draft or submit for admin review."
        />

        {cycleList.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No active cycles available. Ask an admin to publish a cycle first.
          </p>
        ) : (
          <form
            className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const form = new FormData(e.currentTarget);
              const payload = {
                cycleSlug: String(form.get("cycleSlug")),
                weekNumber: Number(form.get("weekNumber")),
                title: String(form.get("title")),
                body: String(form.get("body")),
                mortalityRate: Number(form.get("mortalityRate")) || undefined,
                birdCount: Number(form.get("birdCount")) || undefined,
                feedConsumptionKg: Number(form.get("feedConsumptionKg")) || undefined,
                fcr: Number(form.get("fcr")) || undefined,
                eggCount: Number(form.get("eggCount")) || undefined,
                vaccinationStatus: String(form.get("vaccinationStatus")) || undefined,
                imageUrls: parseImageUrls(String(form.get("imageUrls"))),
              };

              try {
                const result = await createFieldReportFn({ data: payload });
                if ("error" in result && result.error) {
                  toast.error(result.error);
                  return;
                }
                if (submitAfterSave && result.reportId) {
                  await submitFieldReportFn({ data: { reportId: result.reportId } });
                  toast.success("Report submitted for review");
                } else {
                  toast.success("Draft saved");
                }
                await navigate({ to: "/field" });
              } catch {
                toast.error("Could not save report");
              } finally {
                setPending(false);
                setSubmitAfterSave(false);
              }
            }}
          >
            <label className="block text-sm">
              <span className="font-medium">Cycle</span>
              <select
                name="cycleSlug"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                defaultValue={cycleList[0]?.slug}
              >
                {cycleList.map((cycle) => (
                  <option key={cycle.slug} value={cycle.slug}>
                    {cycle.farmName} — {cycle.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Week number</span>
                <input
                  name="weekNumber"
                  type="number"
                  min={1}
                  required
                  defaultValue={1}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Report title</span>
                <input
                  name="title"
                  required
                  placeholder="Week 3 — Mortality stable, FCR on track"
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Field notes</span>
              <textarea
                name="body"
                required
                rows={5}
                placeholder="What happened on the farm this week?"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Mortality %</span>
                <input
                  name="mortalityRate"
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Bird count</span>
                <input
                  name="birdCount"
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Feed (kg)</span>
                <input
                  name="feedConsumptionKg"
                  type="number"
                  step="0.1"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">FCR</span>
                <input
                  name="fcr"
                  type="number"
                  step="0.01"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Vaccination status</span>
              <input
                name="vaccinationStatus"
                placeholder="Gumboro dose 2 completed"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Photo URLs (one per line, max 5)</span>
              <textarea
                name="imageUrls"
                rows={3}
                placeholder="https://..."
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
              />
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save draft"}
              </button>
              <button
                type="submit"
                disabled={pending}
                onClick={() => setSubmitAfterSave(true)}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
              >
                Save & submit
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
