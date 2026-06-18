import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  getFieldReportFn,
  listFieldCyclesFn,
  submitFieldReportFn,
  updateFieldReportFn,
} from "@/lib/api/field.reports.functions";

export const Route = createFileRoute("/field/reports/$reportId")({
  loader: async ({ params }) => {
    const [report, cycles] = await Promise.all([
      getFieldReportFn({ data: { reportId: params.reportId } }),
      listFieldCyclesFn(),
    ]);
    if ("error" in report) throw notFound();
    return { report, cycles };
  },
  component: EditFieldReportPage,
});

function parseImageUrls(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function EditFieldReportPage() {
  const { report, cycles } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const cycleList = "error" in cycles ? [] : cycles;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/field" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to reports
        </Link>
        <SectionHeader eyebrow="Edit report" title={report.title} sub={`${report.farmName} · ${report.cycleTitle}`} />

        {report.status === "rejected" && report.rejectionReason && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Rejected: {report.rejectionReason}
          </p>
        )}

        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const form = new FormData(e.currentTarget);
            const submit = form.get("action") === "submit";

            try {
              const result = await updateFieldReportFn({
                data: {
                  reportId: report.id,
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
                },
              });
              if ("error" in result && result.error) {
                toast.error(result.error);
                return;
              }
              if (submit) {
                const submitted = await submitFieldReportFn({ data: { reportId: report.id } });
                if ("error" in submitted && submitted.error) {
                  toast.error(submitted.error);
                  return;
                }
                toast.success("Submitted for admin review");
              } else {
                toast.success("Draft updated");
              }
              await navigate({ to: "/field" });
            } catch {
              toast.error("Could not update report");
            } finally {
              setPending(false);
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-medium">Cycle</span>
            <select
              name="cycleSlug"
              required
              defaultValue={report.cycleSlug}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
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
                defaultValue={report.weekNumber}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Report title</span>
              <input
                name="title"
                required
                defaultValue={report.title}
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
              defaultValue={report.body}
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
                defaultValue={report.mortalityRate ?? ""}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Bird count</span>
              <input
                name="birdCount"
                type="number"
                defaultValue={report.birdCount ?? ""}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Feed (kg)</span>
              <input
                name="feedConsumptionKg"
                type="number"
                step="0.1"
                defaultValue={report.feedConsumptionKg ?? ""}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">FCR</span>
              <input
                name="fcr"
                type="number"
                step="0.01"
                defaultValue={report.fcr ?? ""}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium">Vaccination status</span>
            <input
              name="vaccinationStatus"
              defaultValue={report.vaccinationStatus ?? ""}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Photo URLs (one per line)</span>
            <textarea
              name="imageUrls"
              rows={3}
              defaultValue={report.imageUrls.join("\n")}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              name="action"
              value="draft"
              disabled={pending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save draft"}
            </button>
            <button
              type="submit"
              name="action"
              value="submit"
              disabled={pending}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              Submit for review
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
