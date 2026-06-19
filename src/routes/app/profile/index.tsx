import { Link, createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  changePasswordFn,
  updateBankDetailsFn,
  updateProfileFn,
} from "@/lib/api/auth.functions";
import { nigerianBanks } from "@/lib/nigeria-data";
import { formatNgPhoneDisplay } from "@/lib/phone";
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

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-forest text-white" : "border border-border text-muted-foreground"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

function ProfilePage() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [bankPending, setBankPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  if (!user) return null;

  const kycDone = user.kycStatus === "verified";
  const phoneDone = Boolean(user.phone);
  const bankDone = Boolean(user.bankName && user.accountNumber && user.accountName);
  const readyToInvest = kycDone;
  const readyToWithdraw = kycDone && bankDone;

  const phoneDisplay = user.phone ? formatNgPhoneDisplay(user.phone) : "";

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-lg">
        <SectionHeader
          eyebrow="Account"
          title="Your profile."
          sub="Keep your contact, bank, and security details up to date before going live."
        />

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Account readiness</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete these steps to invest and withdraw without delays.
            </p>
            <ul className="mt-4 space-y-2">
              <CheckItem done={kycDone} label="Identity verification (KYC)" />
              <CheckItem done={phoneDone} label="Phone number for SMS alerts" />
              <CheckItem done={bankDone} label="Bank details for withdrawals" />
            </ul>
            {!readyToInvest && (
              <Link
                to="/auth/kyc"
                className="mt-4 inline-flex text-sm font-medium text-forest-deep hover:underline"
              >
                Complete KYC →
              </Link>
            )}
            {readyToInvest && !phoneDone && (
              <p className="mt-4 text-sm text-amber-800">
                Add your phone below to receive deposit and withdrawal SMS alerts.
              </p>
            )}
            {readyToInvest && !bankDone && (
              <p className="mt-2 text-sm text-muted-foreground">
                Add bank details before requesting a withdrawal.
              </p>
            )}
            {readyToWithdraw && (
              <p className="mt-4 text-sm text-forest-deep">Your account is ready for investing and withdrawals.</p>
            )}
          </div>

          {user.kycStatus === "rejected" && user.kycRejectionReason && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
              <h3 className="font-semibold text-destructive">KYC not approved</h3>
              <p className="mt-2 text-sm text-muted-foreground">{user.kycRejectionReason}</p>
              <Link
                to="/auth/kyc"
                className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Resubmit KYC
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Verification</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">KYC status</dt>
                <dd className="font-medium">{KYC_LABELS[user.kycStatus]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </div>
              {user.phone && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{phoneDisplay}</dd>
                </div>
              )}
              {user.createdAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd>
                    {new Date(user.createdAt).toLocaleDateString("en-NG", {
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              )}
              {user.kycStatus === "verified" && user.address && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-right">
                    {user.address}, {user.city}, {user.state}
                  </dd>
                </div>
              )}
            </dl>
            {user.kycStatus !== "verified" && user.kycStatus !== "rejected" && (
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
              <span className="font-medium">Phone (Nigeria)</span>
              <input
                name="phone"
                type="tel"
                defaultValue={phoneDisplay}
                placeholder="08012345678"
                required
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Used for SMS alerts on deposits, withdrawals, and KYC updates.
              </span>
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
              Required for withdrawals. Nigerian NUBAN account (10 digits).
            </p>
            <label className="block text-sm">
              <span className="font-medium">Bank</span>
              <select
                name="bankName"
                defaultValue={user.bankName ?? ""}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
              >
                <option value="" disabled>
                  Select bank
                </option>
                {nigerianBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
                {user.bankName && !nigerianBanks.includes(user.bankName as (typeof nigerianBanks)[number]) && (
                  <option value={user.bankName}>{user.bankName}</option>
                )}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Account number</span>
              <input
                name="accountNumber"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                defaultValue=""
                placeholder={user.accountNumber ? "Leave blank to keep current" : "0123456789"}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
              {user.accountNumber && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  On file: {user.accountNumber}
                </span>
              )}
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

          <form
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPasswordPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await changePasswordFn({
                  data: {
                    currentPassword: String(form.get("currentPassword")),
                    newPassword: String(form.get("newPassword")),
                  },
                });
                if ("error" in result && result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Password updated");
                  e.currentTarget.reset();
                }
              } catch {
                toast.error("Could not change password");
              } finally {
                setPasswordPending(false);
              }
            }}
          >
            <h3 className="font-semibold">Change password</h3>
            <label className="block text-sm">
              <span className="font-medium">Current password</span>
              <input
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">New password</span>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={passwordPending}
              className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              {passwordPending ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
