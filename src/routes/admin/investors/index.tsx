import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { listInvestorsFn, reviewKycFn } from "@/lib/api/admin.functions";
import type { AdminInvestorRow } from "@/lib/types";
import type { KycStatus } from "@/lib/types";

const searchSchema = z.object({
  status: z.enum(["all", "pending", "submitted", "verified", "rejected"]).optional(),
});

export const Route = createFileRoute("/admin/investors/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps }) =>
    listInvestorsFn({ data: { status: deps.status ?? "all" } }).then((result) => {
      if ("error" in result) return { investors: [] as AdminInvestorRow[], error: result.error };
      return { investors: result, error: null };
    }),
  component: AdminInvestorsPage,
});

const statusFilters: { label: string; value: KycStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Awaiting review", value: "submitted" },
  { label: "Not started", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
];

function kycBadgeClass(status: KycStatus) {
  switch (status) {
    case "verified":
      return "bg-forest/15 text-forest-deep";
    case "submitted":
      return "bg-accent/30 text-forest-deep";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function AdminInvestorsPage() {
  const { investors, error } = Route.useLoaderData();
  const { status } = Route.useSearch();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleReview(userId: string, action: "approve" | "reject", reason?: string) {
    setPendingId(userId);
    try {
      const result = await reviewKycFn({
        data: { userId, action, reason },
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(action === "approve" ? "KYC approved" : "KYC rejected");
        setRejectingId(null);
        setRejectReason("");
        await router.invalidate();
      }
    } catch {
      toast.error("Action failed. Check MongoDB connection.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Investors"
          title="KYC review queue."
          sub="Approve or reject identity verification before investors can fund cycles."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <Link
              key={f.value}
              to="/admin/investors"
              search={{ status: f.value === "all" ? undefined : f.value }}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                (status ?? "all") === f.value || (!status && f.value === "all")
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error === "Forbidden"
              ? "You do not have admin access."
              : "Could not load investors. Sign in as admin and ensure MongoDB is running."}
          </p>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-bone/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Investor</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">KYC</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {investors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      No investors in this filter.
                    </td>
                  </tr>
                ) : (
                  investors.map((inv) => (
                    <tr key={inv.id} className="hover:bg-bone/30">
                      <td className="px-5 py-4">
                        <div className="font-medium">{inv.fullName}</div>
                        <div className="text-xs text-muted-foreground">{inv.email}</div>
                        {inv.phone && (
                          <div className="text-xs text-muted-foreground">{inv.phone}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {inv.city && inv.state ? `${inv.city}, ${inv.state}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${kycBadgeClass(inv.kycStatus)}`}
                        >
                          {inv.kycStatus}
                        </span>
                        {inv.kycRejectionReason && (
                          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            {inv.kycRejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        {inv.kycStatus === "submitted" ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={pendingId === inv.id}
                              onClick={() => handleReview(inv.id, "approve")}
                              className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={pendingId === inv.id}
                              onClick={() => {
                                setRejectingId(inv.id);
                                setRejectReason("");
                              }}
                              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lifted">
              <h3 className="font-display text-xl">Reject KYC</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Optional reason shown to the investor.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="mt-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. BVN could not be verified"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="rounded-full border border-border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pendingId === rejectingId}
                  onClick={() => handleReview(rejectingId, "reject", rejectReason)}
                  className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
                >
                  Confirm reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
