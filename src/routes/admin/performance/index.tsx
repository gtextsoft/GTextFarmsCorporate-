import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  deleteCompletedCycleFn,
  deletePayoutFn,
  getAdminPerformanceFn,
  updatePlatformMetricsFn,
  upsertCompletedCycleFn,
  upsertPayoutFn,
} from "@/lib/api/admin.performance.functions";

export const Route = createFileRoute("/admin/performance/")({
  loader: () => getAdminPerformanceFn(),
  component: AdminPerformancePage,
});

function AdminPerformancePage() {
  const data = Route.useLoaderData();
  const [pending, setPending] = useState(false);

  if ("error" in data) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{data.error}</p>
      </main>
    );
  }

  const { summary, platformStats, completedCycles, payoutHistory } = data;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-12">
        <SectionHeader
          eyebrow="Admin"
          title="Performance & payouts."
          sub="Platform stats, completed cycles, and payout history shown on /performance and the landing page."
        />

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Platform summary</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await updatePlatformMetricsFn({
                  data: {
                    totalCycles: Number(form.get("totalCycles")),
                    completedCycles: Number(form.get("completedCycles")),
                    successRate: String(form.get("successRate")),
                    totalPaidOut: String(form.get("totalPaidOut")),
                    avgRoiDelivered: String(form.get("avgRoiDelivered")),
                    totalInvestors: Number(form.get("totalInvestors")),
                    platformStatsJson: String(form.get("platformStatsJson")),
                  },
                });
                if ("error" in result && result.error) toast.error(result.error);
                else toast.success("Metrics saved");
              } catch {
                toast.error("Could not save metrics");
              } finally {
                setPending(false);
              }
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["totalCycles", summary.totalCycles],
                  ["completedCycles", summary.completedCycles],
                  ["successRate", summary.successRate],
                  ["totalPaidOut", summary.totalPaidOut],
                  ["avgRoiDelivered", summary.avgRoiDelivered],
                  ["totalInvestors", summary.totalInvestors],
                ] as const
              ).map(([name, value]) => (
                <label key={name} className="block text-sm">
                  <span className="font-medium capitalize">{name.replace(/([A-Z])/g, " $1")}</span>
                  <input
                    name={name}
                    defaultValue={value}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                  />
                </label>
              ))}
            </div>
            <label className="block text-sm">
              <span className="font-medium">Platform stats (JSON array)</span>
              <textarea
                name="platformStatsJson"
                rows={6}
                defaultValue={JSON.stringify(platformStats, null, 2)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Save summary
            </button>
          </form>
        </section>

        <CompletedCycleSection cycles={completedCycles} />
        <PayoutSection payouts={payoutHistory} />
      </div>
    </main>
  );
}

function CompletedCycleSection({
  cycles,
}: {
  cycles: Array<{
    id: string;
    title: string;
    farmName: string;
    type: string;
    roiProjected: string;
    roiDelivered: string;
    status: string;
    completedDate: string;
    investors: number;
  }>;
}) {
  const [pending, setPending] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-semibold">Completed cycles</h2>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const form = new FormData(e.currentTarget);
          try {
            const result = await upsertCompletedCycleFn({
              data: {
                cycleId: String(form.get("cycleId")),
                title: String(form.get("title")),
                farmName: String(form.get("farmName")),
                type: String(form.get("type")),
                roiProjected: String(form.get("roiProjected")),
                roiDelivered: String(form.get("roiDelivered")),
                status: String(form.get("status")) as "Completed" | "Closed",
                completedDate: String(form.get("completedDate")),
                investors: Number(form.get("investors")),
              },
            });
            if ("error" in result && result.error) toast.error(result.error);
            else {
              toast.success("Cycle record saved");
              window.location.reload();
            }
          } catch {
            toast.error("Could not save cycle record");
          } finally {
            setPending(false);
          }
        }}
      >
        <input name="cycleId" placeholder="cycle-id slug" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="title" placeholder="Title" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="farmName" placeholder="Farm name" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="type" placeholder="Type" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="roiProjected" placeholder="ROI projected" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="roiDelivered" placeholder="ROI delivered" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="completedDate" placeholder="Completed date" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="investors" type="number" placeholder="Investors" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <select name="status" className="rounded-xl border border-border px-3 py-2 text-sm">
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>
        <button type="submit" disabled={pending} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground sm:col-span-2">
          Add / update cycle record
        </button>
      </form>

      <ul className="mt-6 divide-y divide-border text-sm">
        {cycles.map((cycle) => (
          <li key={cycle.id} className="flex items-center justify-between gap-4 py-3">
            <span>
              <strong>{cycle.title}</strong> · {cycle.roiDelivered} delivered
            </span>
            <button
              type="button"
              className="text-destructive hover:underline"
              onClick={async () => {
                if (!confirm(`Delete ${cycle.title}?`)) return;
                const result = await deleteCompletedCycleFn({ data: { cycleId: cycle.id } });
                if ("error" in result && result.error) toast.error(result.error);
                else window.location.reload();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PayoutSection({
  payouts,
}: {
  payouts: Array<{
    cycleId: string;
    cycleTitle: string;
    investors: number;
    capitalReturned: string;
    profitPaid: string;
    payoutDate: string;
  }>;
}) {
  const [pending, setPending] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-semibold">Payouts</h2>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const form = new FormData(e.currentTarget);
          try {
            const result = await upsertPayoutFn({
              data: {
                cycleId: String(form.get("cycleId")),
                cycleTitle: String(form.get("cycleTitle")),
                investors: Number(form.get("investors")),
                capitalReturned: String(form.get("capitalReturned")),
                profitPaid: String(form.get("profitPaid")),
                payoutDate: String(form.get("payoutDate")),
                verified: form.get("verified") === "on",
              },
            });
            if ("error" in result && result.error) toast.error(result.error);
            else {
              toast.success("Payout saved");
              window.location.reload();
            }
          } catch {
            toast.error("Could not save payout");
          } finally {
            setPending(false);
          }
        }}
      >
        <input name="cycleId" placeholder="cycle-id slug" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="cycleTitle" placeholder="Cycle title" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="investors" type="number" placeholder="Investors" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="capitalReturned" placeholder="Capital returned" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="profitPaid" placeholder="Profit paid" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <input name="payoutDate" placeholder="Payout date" required className="rounded-xl border border-border px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="verified" defaultChecked className="size-4" />
          Verified payout
        </label>
        <button type="submit" disabled={pending} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground sm:col-span-2">
          Add / update payout
        </button>
      </form>

      <ul className="mt-6 divide-y divide-border text-sm">
        {payouts.map((payout) => (
          <li key={payout.cycleId} className="flex items-center justify-between gap-4 py-3">
            <span>
              <strong>{payout.cycleTitle}</strong> · {payout.profitPaid} profit · {payout.payoutDate}
            </span>
            <button
              type="button"
              className="text-destructive hover:underline"
              onClick={async () => {
                if (!confirm(`Delete payout for ${payout.cycleTitle}?`)) return;
                const result = await deletePayoutFn({ data: { cycleId: payout.cycleId } });
                if ("error" in result && result.error) toast.error(result.error);
                else window.location.reload();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
