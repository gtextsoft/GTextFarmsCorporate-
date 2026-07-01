import { Link, createFileRoute } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/co-operative/")({
  head: () =>
    buildPageHead({
      title: "Co-operative Society",
      description:
        "Join GText Farms Co-operative Society — register as a member, complete your profile, and access poultry farming investment opportunities across Nigeria.",
      path: "/co-operative",
    }),
  component: CoopLandingPage,
});

function CoopLandingPage() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeader
          eyebrow="GText Farms Co-operative Society"
          title="Welcome to the co-operative."
          sub="New participants register to become members, receive a membership number and bylaws, complete their profile, and access poultry investment opportunities."
          align="center"
        />

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/co-operative/register"
            className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Register as a member
          </Link>
          <Link
            to="/co-operative/login"
            className="inline-flex rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted/50"
          >
            Member sign in
          </Link>
        </div>

        <ol className="mt-16 space-y-4 text-left text-sm text-muted-foreground">
          <li className="rounded-xl border border-border bg-card p-4">
            <span className="font-medium text-foreground">1. Register</span> — Create your account with
            name, email, and password.
          </li>
          <li className="rounded-xl border border-border bg-card p-4">
            <span className="font-medium text-foreground">2. Verify email</span> — Confirm your address
            to receive your membership number and bylaws.
          </li>
          <li className="rounded-xl border border-border bg-card p-4">
            <span className="font-medium text-foreground">3. Complete profile</span> — Submit personal,
            identification, next of kin, and bank details to become a full member.
          </li>
          <li className="rounded-xl border border-border bg-card p-4">
            <span className="font-medium text-foreground">4. Fund & invest</span> — Make payment, review
            the investment memorandum, and invest in available packages.
          </li>
        </ol>
      </div>
    </section>
  );
}
