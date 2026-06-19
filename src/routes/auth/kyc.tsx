import { Link, createFileRoute, redirect, useRouter, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { submitKycFn } from "@/lib/api/auth.functions";
import { nigerianStates } from "@/lib/nigeria-data";
import { formatNgPhoneDisplay } from "@/lib/phone";

export const Route = createFileRoute("/auth/kyc")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
    if (context.user.kycStatus === "verified") {
      throw redirect({ to: "/app" });
    }
  },
  head: () => ({ meta: [{ title: "Complete KYC — GText Farms" }] }),
  component: KycPage,
});

function KycPage() {
  const { user: current } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const isSubmitted = current?.kycStatus === "submitted";

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-lg">
          <SectionHeader
            eyebrow="Identity verification"
            title="Complete your KYC."
            sub="Required before you can invest. We verify BVN/NIN through licensed partners and never store raw identifiers in plain text."
          />

          {isSubmitted ? (
            <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="font-display text-2xl">Verification in progress</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Your documents are under review. Most verifications complete within 24 hours. We'll
                notify you when you can start investing.
              </p>
              <Link
                to="/app"
                className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Go to dashboard
              </Link>
            </div>
          ) : (
            <form
              className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
              onSubmit={async (e) => {
                e.preventDefault();
                setPending(true);
                const form = new FormData(e.currentTarget);
                try {
                  const result = await submitKycFn({
                    data: {
                      fullName: String(form.get("fullName")),
                      phone: String(form.get("phone")),
                      address: String(form.get("address")),
                      city: String(form.get("city")),
                      state: String(form.get("state")),
                      bvn: String(form.get("bvn")),
                      nin: String(form.get("nin") || ""),
                    },
                  });
                  if (result?.error) {
                    toast.error(result.error);
                  } else {
                    toast.success("KYC submitted for review");
                    await router.invalidate();
                  }
                } catch {
                  toast.error("Could not submit KYC. Check your connection and MongoDB setup.");
                } finally {
                  setPending(false);
                }
              }}
            >
              <div>
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full name (as on ID)
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  defaultValue={current?.fullName}
                  required
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={current?.phone ? formatNgPhoneDisplay(current.phone) : ""}
                  placeholder="08012345678"
                  required
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  For SMS alerts on deposits, withdrawals, and verification updates.
                </p>
              </div>
              <div>
                <label htmlFor="address" className="text-sm font-medium">
                  Residential address
                </label>
                <input
                  id="address"
                  name="address"
                  required
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="text-sm font-medium">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    defaultValue={current?.state ?? ""}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="bvn" className="text-sm font-medium">
                  BVN
                </label>
                <input
                  id="bvn"
                  name="bvn"
                  inputMode="numeric"
                  pattern="\d{11}"
                  maxLength={11}
                  required
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="nin" className="text-sm font-medium">
                  NIN (optional)
                </label>
                <input
                  id="nin"
                  name="nin"
                  inputMode="numeric"
                  pattern="\d{11}"
                  maxLength={11}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                By submitting, you consent to identity verification under our{" "}
                <Link to="/legal/privacy" className="text-forest-deep hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit for verification"}
              </button>
            </form>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
