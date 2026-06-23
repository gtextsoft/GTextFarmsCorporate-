import { Link, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { isRedirect } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { completeCoopProfileFn } from "@/lib/api/coop.functions";
import { nigerianBanks, nigerianStates } from "@/lib/nigeria-data";

export const Route = createFileRoute("/co-operative/complete-profile")({
  beforeLoad: ({ context }) => {
    if (context.user?.membershipStatus === "full_member") {
      throw redirect({ to: "/co-operative/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Complete Profile — GText Co-operative" }] }),
  component: CompleteProfilePage,
});

const inputClass =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function CompleteProfilePage() {
  const { user } = useRouteContext({ from: "__root__" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeader
          eyebrow="Full membership"
          title="Complete your member profile."
          sub="Submit your personal, identification, next of kin, and bank details to become a full member of the co-operative."
        />

        {user?.membershipNumber && (
          <div className="mt-6 rounded-xl border border-forest/30 bg-forest/5 p-4 text-sm">
            <p className="font-medium">Membership number</p>
            <p className="mt-1 font-mono text-lg text-forest-deep">{user.membershipNumber}</p>
          </div>
        )}

        <form
          className="mt-8 space-y-10"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError(null);
            const form = new FormData(e.currentTarget);
            try {
              const result = await completeCoopProfileFn({
                data: {
                  dateOfBirth: String(form.get("dateOfBirth")),
                  gender: String(form.get("gender")) as "male" | "female" | "other",
                  nationality: String(form.get("nationality")),
                  phone: String(form.get("phone")),
                  idType: String(form.get("idType")) as
                    | "nin"
                    | "passport"
                    | "voter_card"
                    | "drivers_licence"
                    | "other",
                  idNumber: String(form.get("idNumber")),
                  idDocumentUrl: String(form.get("idDocumentUrl") || ""),
                  passportPhotoUrl: String(form.get("passportPhotoUrl") || ""),
                  address: String(form.get("address")),
                  city: String(form.get("city")),
                  state: String(form.get("state")),
                  occupation: String(form.get("occupation") || ""),
                  employer: String(form.get("employer") || ""),
                  nextOfKinName: String(form.get("nextOfKinName")),
                  nextOfKinRelationship: String(form.get("nextOfKinRelationship")),
                  nextOfKinAddress: String(form.get("nextOfKinAddress")),
                  nextOfKinPhone: String(form.get("nextOfKinPhone")),
                  bankName: String(form.get("bankName")),
                  accountNumber: String(form.get("accountNumber")),
                  accountName: String(form.get("accountName")),
                  acceptBylaws: form.get("acceptBylaws") === "on",
                },
              });
              if (result && "error" in result && result.error) {
                setError(result.error);
                toast.error(result.error);
              }
            } catch (err) {
              if (isRedirect(err)) throw err;
              toast.error("Could not save profile. Please try again.");
            } finally {
              setPending(false);
            }
          }}
        >
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Personal information</legend>
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                readOnly
                value={user?.fullName ?? ""}
                className={`${inputClass} bg-muted/40`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of birth
                </label>
                <input id="dateOfBirth" name="dateOfBirth" type="date" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
                <select id="gender" name="gender" required className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="nationality" className="text-sm font-medium">
                Nationality
              </label>
              <input
                id="nationality"
                name="nationality"
                required
                defaultValue="Nigerian"
                className={inputClass}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Contact information</legend>
            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="08012345678"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input readOnly value={user?.email ?? ""} className={`${inputClass} bg-muted/40`} />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Identification details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="idType" className="text-sm font-medium">
                  ID type
                </label>
                <select id="idType" name="idType" required className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="nin">National ID (NIN)</option>
                  <option value="passport">International passport</option>
                  <option value="voter_card">Voter card</option>
                  <option value="drivers_licence">Driver&apos;s licence</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="idNumber" className="text-sm font-medium">
                  ID number
                </label>
                <input id="idNumber" name="idNumber" required className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="idDocumentUrl" className="text-sm font-medium">
                ID document link
              </label>
              <input
                id="idDocumentUrl"
                name="idDocumentUrl"
                type="url"
                placeholder="https://..."
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Paste a link to your ID scan. File upload will be added in a later update.
              </p>
            </div>
            <div>
              <label htmlFor="passportPhotoUrl" className="text-sm font-medium">
                Passport photograph link
              </label>
              <input
                id="passportPhotoUrl"
                name="passportPhotoUrl"
                type="url"
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Next of kin</legend>
            <div>
              <label htmlFor="nextOfKinName" className="text-sm font-medium">
                Full name
              </label>
              <input id="nextOfKinName" name="nextOfKinName" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="nextOfKinRelationship" className="text-sm font-medium">
                Relationship
              </label>
              <input id="nextOfKinRelationship" name="nextOfKinRelationship" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="nextOfKinAddress" className="text-sm font-medium">
                Address
              </label>
              <input id="nextOfKinAddress" name="nextOfKinAddress" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="nextOfKinPhone" className="text-sm font-medium">
                Phone number
              </label>
              <input id="nextOfKinPhone" name="nextOfKinPhone" type="tel" required className={inputClass} />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Residential address</legend>
            <div>
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <input id="address" name="address" required className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="text-sm font-medium">
                  City
                </label>
                <input id="city" name="city" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="state" className="text-sm font-medium">
                  State
                </label>
                <select id="state" name="state" required className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Select state
                  </option>
                  {nigerianStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="occupation" className="text-sm font-medium">
                  Occupation
                </label>
                <input id="occupation" name="occupation" className={inputClass} />
              </div>
              <div>
                <label htmlFor="employer" className="text-sm font-medium">
                  Employer / business
                </label>
                <input id="employer" name="employer" className={inputClass} />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Bank details (for payouts)</legend>
            <div>
              <label htmlFor="bankName" className="text-sm font-medium">
                Bank name
              </label>
              <select id="bankName" name="bankName" required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select bank
                </option>
                {nigerianBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="accountNumber" className="text-sm font-medium">
                Account number
              </label>
              <input
                id="accountNumber"
                name="accountNumber"
                required
                pattern="\d{10}"
                maxLength={10}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="accountName" className="text-sm font-medium">
                Account name
              </label>
              <input id="accountName" name="accountName" required className={inputClass} />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Membership agreement</legend>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="acceptBylaws"
                required
                className="mt-1 size-4 rounded border-input"
              />
              <span>
                I agree to abide by the{" "}
                <Link to="/legal/cooperative-bylaws" className="text-forest-deep hover:underline">
                  co-operative bylaws and regulations
                </Link>
                .
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit profile & become full member"}
          </button>
        </form>
      </div>
    </section>
  );
}
