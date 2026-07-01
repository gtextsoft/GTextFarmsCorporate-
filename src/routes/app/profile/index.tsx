import { Link, createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import { CheckCircle2, Circle, KeyRound, Landmark, ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const KYC_TONE: Record<KycStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  submitted: "bg-sky-100 text-sky-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-destructive/10 text-destructive",
};

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {done ? (
        <CheckCircle2 className="size-5 shrink-0 text-forest" />
      ) : (
        <Circle className="size-5 shrink-0 text-muted-foreground/50" />
      )}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

const fieldClass = "mt-1.5";

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
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-deep">
            Account
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Your profile
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Keep your contact, bank, and security details up to date so you can invest and withdraw
            without delays.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Status column */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <CheckItem done={kycDone} label="Identity verification (KYC)" />
                  <CheckItem done={phoneDone} label="Phone number for SMS alerts" />
                  <CheckItem done={bankDone} label="Bank details for withdrawals" />
                </ul>
                {readyToWithdraw ? (
                  <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Your account is ready for investing and withdrawals.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2 text-sm">
                    {!readyToInvest && (
                      <Link
                        to="/auth/kyc"
                        className="inline-flex font-medium text-forest-deep hover:underline"
                      >
                        Complete KYC →
                      </Link>
                    )}
                    {readyToInvest && !phoneDone && (
                      <p className="text-amber-800">Add your phone below for deposit and withdrawal alerts.</p>
                    )}
                    {readyToInvest && !bankDone && (
                      <p className="text-muted-foreground">Add bank details before requesting a withdrawal.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {user.kycStatus === "rejected" && user.kycRejectionReason && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">KYC not approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{user.kycRejectionReason}</p>
                  <Button asChild className="mt-4 rounded-xl">
                    <Link to="/auth/kyc">Resubmit KYC</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  <ShieldCheck className="mr-1.5 inline size-4 text-forest" />
                  Verification
                </CardTitle>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KYC_TONE[user.kycStatus]}`}
                >
                  {KYC_LABELS[user.kycStatus]}
                </span>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="text-right">{user.email}</dd>
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
                  {kycDone && user.address && (
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
              </CardContent>
            </Card>
          </div>

          {/* Forms column */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <UserCog className="mr-1.5 inline size-4 text-forest" />
                  Contact details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={user.fullName}
                        required
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone (Nigeria)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={phoneDisplay}
                        placeholder="08012345678"
                        required
                        className={fieldClass}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your phone is used for SMS alerts on deposits, withdrawals, and KYC updates.
                  </p>
                  <Button type="submit" disabled={pending} className="rounded-xl">
                    {pending ? "Saving…" : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <Landmark className="mr-1.5 inline size-4 text-forest" />
                  Bank details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
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
                  <p className="text-sm text-muted-foreground">
                    Required for withdrawals. Nigerian NUBAN account (10 digits).
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="bankName">Bank</Label>
                      <select
                        id="bankName"
                        name="bankName"
                        defaultValue={user.bankName ?? ""}
                        required
                        className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="" disabled>
                          Select bank
                        </option>
                        {nigerianBanks.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                        {user.bankName &&
                          !nigerianBanks.includes(user.bankName as (typeof nigerianBanks)[number]) && (
                            <option value={user.bankName}>{user.bankName}</option>
                          )}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="accountName">Account name</Label>
                      <Input
                        id="accountName"
                        name="accountName"
                        defaultValue={user.accountName ?? ""}
                        required
                        className={fieldClass}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      defaultValue=""
                      placeholder={user.accountNumber ? "Leave blank to keep current" : "0123456789"}
                      className={fieldClass}
                    />
                    {user.accountNumber && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        On file: {user.accountNumber}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={bankPending}
                    variant="outline"
                    className="rounded-xl"
                  >
                    {bankPending ? "Saving…" : "Save bank details"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <KeyRound className="mr-1.5 inline size-4 text-forest" />
                  Change password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPasswordPending(true);
                    const form = new FormData(e.currentTarget);
                    const target = e.currentTarget;
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
                        target.reset();
                      }
                    } catch {
                      toast.error("Could not change password");
                    } finally {
                      setPasswordPending(false);
                    }
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="currentPassword">Current password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        autoComplete="current-password"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordPending}
                    variant="outline"
                    className="rounded-xl"
                  >
                    {passwordPending ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
