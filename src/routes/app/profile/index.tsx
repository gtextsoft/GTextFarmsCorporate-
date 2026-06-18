import { Link, createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { updateProfileFn, updateBankDetailsFn } from "@/lib/api/auth.functions";
import type { KycStatus } from "@/lib/types";

export const Route = createFileRoute("/app/profile/")({
  head: () => ({ meta: [{ title: "Profile — GText Farms" }] }),
  component: ProfilePage,
});

const KYC_LABELS: Record<KycStatus, string> = {
  pending: "Not started",
  submitted: "Under review",
  verified: "Verified",
  rejected: "Rejected",
};

function ProfilePage() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [bankPending, setBankPending] = useState(false);

  if (!user) return null;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <SectionHeader
          eyebrow="Account"
          title="Your profile."
          sub="Contact details and verification status."
        />

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Verification</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">KYC status</dt>
                <dd className="font-medium capitalize">{KYC_LABELS[user.kycStatus]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </div>
              {user.kycStatus === "verified" && user.address && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-right">
                    {user.address}, {user.city}, {user.state}
                  </dd>
                </div>
              )}
            </dl>
            {user.kycStatus !== "verified" && (
              <Link
                to="/auth/kyc"
                className="mt-4 inline-flex text-sm font-medium text-forest-deep hover:underline"
              >
                {user.kycStatus === "submitted" ? "View KYC status" : "Complete KYC"} →
              </Link>
            )}
          </div>

          <form
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await updateProfileFn({
                  data: {
                    fullName: String(form.get("fullName")),
                    phone: String(form.get("phone")),
                  },
                });
                if ("error" in result && result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Profile updated");
                  await router.invalidate();
                }
              } catch {
                toast.error("Could not update profile");
              } finally {
                setPending(false);
              }
            }}
          >
            <h3 className="font-semibold">Contact details</h3>
            <label className="block text-sm">
              <span className="font-medium">Full name</span>
              <input
                name="fullName"
                defaultValue={user.fullName}
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Phone</span>
              <input
                name="phone"
                defaultValue={user.phone ?? ""}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </form>

          <form
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setBankPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await updateBankDetailsFn({
                  data: {
                    bankName: String(form.get("bankName")),
                    accountNumber: String(form.get("accountNumber")),
                    accountName: String(form.get("accountName")),
                  },
                });
                if ("error" in result && result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Bank details saved");
                  await router.invalidate();
                }
              } catch {
                toast.error("Could not save bank details");
              } finally {
                setBankPending(false);
              }
            }}
          >
            <h3 className="font-semibold">Bank details</h3>
            <p className="text-sm text-muted-foreground">
              Required for withdrawals. Nigerian bank account (10 digits).
            </p>
            <label className="block text-sm">
              <span className="font-medium">Bank name</span>
              <input
                name="bankName"
                defaultValue={user.bankName ?? ""}
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Account number</span>
              <input
                name="accountNumber"
                inputMode="numeric"
                pattern="\d{10}"
                defaultValue={user.accountNumber?.replace(/\*/g, "") ?? ""}
                placeholder="0123456789"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Account name</span>
              <input
                name="accountName"
                defaultValue={user.accountName ?? ""}
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={bankPending}
              className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              {bankPending ? "Saving…" : "Save bank details"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
