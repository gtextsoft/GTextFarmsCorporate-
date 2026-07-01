import { Link, createFileRoute, redirect, useRouteContext, useRouter } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/marketing/Logo";
import { useSignOut } from "@/hooks/use-sign-out";
import { completeCoopProfileFn } from "@/lib/api/coop.functions";
import { getCoopMemberHomePath } from "@/lib/coop-membership";
import { handleClientRedirect } from "@/lib/client-redirect";
import { nigerianBanks, nigerianStates } from "@/lib/nigeria-data";
import { isValidNgPhone } from "@/lib/phone";

export const Route = createFileRoute("/co-operative/complete-profile")({
  beforeLoad: ({ context }) => {
    const status = context.user?.membershipStatus;
    if (status && status !== "provisional_member" && context.user) {
      throw redirect({ to: getCoopMemberHomePath(context.user) });
    }
  },
  head: () => ({ meta: [{ title: "Complete Profile — GText Co-operative" }] }),
  component: CompleteProfilePage,
});

const inputClass =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

type FormState = {
  dateOfBirth: string;
  gender: "" | "male" | "female" | "other";
  nationality: string;
  phone: string;
  idType: "" | "nin" | "passport" | "voter_card" | "drivers_licence" | "other";
  idNumber: string;
  idDocumentUrl: string;
  passportPhotoUrl: string;
  address: string;
  city: string;
  state: string;
  occupation: string;
  employer: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinAddress: string;
  nextOfKinPhone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  acceptBylaws: boolean;
};

const initialForm: FormState = {
  dateOfBirth: "",
  gender: "",
  nationality: "Nigerian",
  phone: "",
  idType: "",
  idNumber: "",
  idDocumentUrl: "",
  passportPhotoUrl: "",
  address: "",
  city: "",
  state: "",
  occupation: "",
  employer: "",
  nextOfKinName: "",
  nextOfKinRelationship: "",
  nextOfKinAddress: "",
  nextOfKinPhone: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  acceptBylaws: false,
};

const STEPS = [
  { title: "Personal details", subtitle: "Tell us who you are." },
  { title: "Identification", subtitle: "Confirm your identity." },
  { title: "Address & work", subtitle: "Where you live and what you do." },
  { title: "Next of kin", subtitle: "Someone we can reach on your behalf." },
  { title: "Bank details", subtitle: "Where your payouts are sent." },
  { title: "Review & confirm", subtitle: "Check everything, then accept the bylaws." },
] as const;

const ID_TYPE_LABELS: Record<Exclude<FormState["idType"], "">, string> = {
  nin: "National ID (NIN)",
  passport: "International passport",
  voter_card: "Voter card",
  drivers_licence: "Driver's licence",
  other: "Other",
};

/** Returns an error message for the given step, or null when it's valid. */
function validateStep(step: number, form: FormState): string | null {
  const isUrl = (v: string) => /^https?:\/\/.+/.test(v);
  switch (step) {
    case 0:
      if (!form.dateOfBirth) return "Enter your date of birth.";
      if (!form.gender) return "Select your gender.";
      if (form.nationality.trim().length < 2) return "Enter your nationality.";
      if (!isValidNgPhone(form.phone)) return "Enter a valid phone number (e.g. 08012345678).";
      return null;
    case 1:
      if (!form.idType) return "Select your ID type.";
      if (form.idNumber.trim().length < 3) return "Enter your ID number.";
      if (form.idDocumentUrl && !isUrl(form.idDocumentUrl))
        return "ID document link must be a valid URL (starting with http).";
      if (form.passportPhotoUrl && !isUrl(form.passportPhotoUrl))
        return "Passport photo link must be a valid URL (starting with http).";
      return null;
    case 2:
      if (form.address.trim().length < 5) return "Enter your residential address.";
      if (form.city.trim().length < 2) return "Enter your city.";
      if (!form.state) return "Select your state.";
      return null;
    case 3:
      if (form.nextOfKinName.trim().length < 2) return "Enter your next of kin's full name.";
      if (form.nextOfKinRelationship.trim().length < 2) return "Enter their relationship to you.";
      if (form.nextOfKinAddress.trim().length < 5) return "Enter their address.";
      if (!isValidNgPhone(form.nextOfKinPhone)) return "Enter a valid next of kin phone number.";
      return null;
    case 4:
      if (!form.bankName) return "Select your bank.";
      if (!/^\d{10}$/.test(form.accountNumber)) return "Account number must be 10 digits.";
      if (form.accountName.trim().length < 2) return "Enter the account name.";
      return null;
    case 5:
      if (!form.acceptBylaws) return "You must accept the co-operative bylaws to continue.";
      return null;
    default:
      return null;
  }
}

function CompleteProfilePage() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const { signOut, pending: signingOut } = useSignOut();
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLast = step === STEPS.length - 1;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError(null);
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const result = await completeCoopProfileFn({
        data: {
          dateOfBirth: form.dateOfBirth,
          gender: form.gender as "male" | "female" | "other",
          nationality: form.nationality,
          phone: form.phone,
          idType: form.idType as "nin" | "passport" | "voter_card" | "drivers_licence" | "other",
          idNumber: form.idNumber,
          idDocumentUrl: form.idDocumentUrl,
          passportPhotoUrl: form.passportPhotoUrl,
          address: form.address,
          city: form.city,
          state: form.state,
          occupation: form.occupation,
          employer: form.employer,
          nextOfKinName: form.nextOfKinName,
          nextOfKinRelationship: form.nextOfKinRelationship,
          nextOfKinAddress: form.nextOfKinAddress,
          nextOfKinPhone: form.nextOfKinPhone,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountName: form.accountName,
          acceptBylaws: form.acceptBylaws,
        },
      });
      if (result && "error" in result && result.error) {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      if (await handleClientRedirect(router, err)) return;
      toast.error("Could not save profile. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function handlePrimary(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const stepError = validateStep(step, form);
    if (stepError) {
      setError(stepError);
      toast.error(stepError);
      return;
    }
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    void submit();
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Slim, self-contained header — no public/marketing nav. */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold">GText Co-operative</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.membershipNumber && (
              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest-deep">
                #{user.membershipNumber}
              </span>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto w-full max-w-2xl">
          {/* Progress stepper */}
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-forest-deep" : "bg-border"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="mt-1 font-display text-2xl">{STEPS[step].title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{STEPS[step].subtitle}</p>

          <form onSubmit={handlePrimary} className="mt-8">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              {step === 0 && <PersonalStep user={user} form={form} update={update} />}
              {step === 1 && <IdentificationStep form={form} update={update} />}
              {step === 2 && <AddressStep form={form} update={update} />}
              {step === 3 && <NextOfKinStep form={form} update={update} />}
              {step === 4 && <BankStep form={form} update={update} />}
              {step === 5 && <ReviewStep user={user} form={form} update={update} goToStep={setStep} />}
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || pending}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {isLast
                  ? pending
                    ? "Submitting…"
                    : "Submit profile & continue to payment"
                  : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

type StepProps = {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PersonalStep({
  user,
  form,
  update,
}: StepProps & { user: { fullName?: string; email?: string } | null }) {
  return (
    <>
      <Field label="Full name">
        <input readOnly value={user?.fullName ?? ""} className={`${inputClass} bg-muted/40`} />
      </Field>
      <Field label="Email">
        <input readOnly value={user?.email ?? ""} className={`${inputClass} bg-muted/40`} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" htmlFor="dateOfBirth">
          <input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <select
            id="gender"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value as FormState["gender"])}
            className={inputClass}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Nationality" htmlFor="nationality">
        <input
          id="nationality"
          value={form.nationality}
          onChange={(e) => update("nationality", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Phone number" htmlFor="phone">
        <input
          id="phone"
          type="tel"
          placeholder="08012345678"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={inputClass}
        />
      </Field>
    </>
  );
}

function IdentificationStep({ form, update }: StepProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ID type" htmlFor="idType">
          <select
            id="idType"
            value={form.idType}
            onChange={(e) => update("idType", e.target.value as FormState["idType"])}
            className={inputClass}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="nin">National ID (NIN)</option>
            <option value="passport">International passport</option>
            <option value="voter_card">Voter card</option>
            <option value="drivers_licence">Driver&apos;s licence</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="ID number" htmlFor="idNumber">
          <input
            id="idNumber"
            value={form.idNumber}
            onChange={(e) => update("idNumber", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        label="ID document link"
        htmlFor="idDocumentUrl"
        hint="Paste a link to your ID scan. File upload will be added in a later update."
      >
        <input
          id="idDocumentUrl"
          type="url"
          placeholder="https://..."
          value={form.idDocumentUrl}
          onChange={(e) => update("idDocumentUrl", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Passport photograph link" htmlFor="passportPhotoUrl">
        <input
          id="passportPhotoUrl"
          type="url"
          placeholder="https://..."
          value={form.passportPhotoUrl}
          onChange={(e) => update("passportPhotoUrl", e.target.value)}
          className={inputClass}
        />
      </Field>
    </>
  );
}

function AddressStep({ form, update }: StepProps) {
  return (
    <>
      <Field label="Residential address" htmlFor="address">
        <input
          id="address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor="city">
          <input
            id="city"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="State" htmlFor="state">
          <select
            id="state"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select state
            </option>
            {nigerianStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Occupation (optional)" htmlFor="occupation">
          <input
            id="occupation"
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Employer / business (optional)" htmlFor="employer">
          <input
            id="employer"
            value={form.employer}
            onChange={(e) => update("employer", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
    </>
  );
}

function NextOfKinStep({ form, update }: StepProps) {
  return (
    <>
      <Field label="Full name" htmlFor="nextOfKinName">
        <input
          id="nextOfKinName"
          value={form.nextOfKinName}
          onChange={(e) => update("nextOfKinName", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Relationship" htmlFor="nextOfKinRelationship">
        <input
          id="nextOfKinRelationship"
          value={form.nextOfKinRelationship}
          onChange={(e) => update("nextOfKinRelationship", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Address" htmlFor="nextOfKinAddress">
        <input
          id="nextOfKinAddress"
          value={form.nextOfKinAddress}
          onChange={(e) => update("nextOfKinAddress", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Phone number" htmlFor="nextOfKinPhone">
        <input
          id="nextOfKinPhone"
          type="tel"
          placeholder="08012345678"
          value={form.nextOfKinPhone}
          onChange={(e) => update("nextOfKinPhone", e.target.value)}
          className={inputClass}
        />
      </Field>
    </>
  );
}

function BankStep({ form, update }: StepProps) {
  return (
    <>
      <Field label="Bank name" htmlFor="bankName">
        <select
          id="bankName"
          value={form.bankName}
          onChange={(e) => update("bankName", e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Select bank
          </option>
          {nigerianBanks.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Account number" htmlFor="accountNumber">
        <input
          id="accountNumber"
          inputMode="numeric"
          maxLength={10}
          value={form.accountNumber}
          onChange={(e) => update("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
          className={inputClass}
        />
      </Field>
      <Field label="Account name" htmlFor="accountName">
        <input
          id="accountName"
          value={form.accountName}
          onChange={(e) => update("accountName", e.target.value)}
          className={inputClass}
        />
      </Field>
    </>
  );
}

function ReviewStep({
  user,
  form,
  update,
  goToStep,
}: StepProps & {
  user: { fullName?: string; email?: string } | null;
  goToStep: (step: number) => void;
}) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Full name", value: user?.fullName ?? "—", step: 0 },
    { label: "Date of birth", value: form.dateOfBirth || "—", step: 0 },
    { label: "Gender", value: form.gender || "—", step: 0 },
    { label: "Phone", value: form.phone || "—", step: 0 },
    { label: "ID type", value: form.idType ? ID_TYPE_LABELS[form.idType] : "—", step: 1 },
    { label: "ID number", value: form.idNumber || "—", step: 1 },
    {
      label: "Address",
      value: [form.address, form.city, form.state].filter(Boolean).join(", ") || "—",
      step: 2,
    },
    { label: "Next of kin", value: form.nextOfKinName || "—", step: 3 },
    {
      label: "Bank",
      value: [form.bankName, form.accountNumber].filter(Boolean).join(" · ") || "—",
      step: 4,
    },
  ];

  return (
    <>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="flex items-center gap-3 text-right text-sm font-medium capitalize">
              <span>{row.value}</span>
              <button
                type="button"
                onClick={() => goToStep(row.step)}
                className="text-xs font-medium text-forest-deep hover:underline"
              >
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <label className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm">
        <input
          type="checkbox"
          checked={form.acceptBylaws}
          onChange={(e) => update("acceptBylaws", e.target.checked)}
          className="mt-0.5 size-4 rounded border-input"
        />
        <span>
          I agree to abide by the{" "}
          <Link
            to="/legal/cooperative-bylaws"
            target="_blank"
            className="text-forest-deep hover:underline"
          >
            co-operative bylaws and regulations
          </Link>
          .
        </span>
      </label>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="size-3.5 text-forest-deep" />
        The final step to full membership is paying the ₦10,000 entrance fee.
      </p>
    </>
  );
}
