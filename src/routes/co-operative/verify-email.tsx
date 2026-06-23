import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { resendCoopVerificationFn } from "@/lib/api/coop.functions";

export const Route = createFileRoute("/co-operative/verify-email")({
  beforeLoad: ({ context }) => {
    if (context.user?.membershipStatus === "full_member") {
      throw redirect({ to: "/co-operative/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Verify Email — GText Co-operative" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [pending, setPending] = useState(false);

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-lg text-center">
        <SectionHeader
          eyebrow="Almost there"
          title="Check your email."
          sub="We sent a verification link to your inbox. Click the link to receive your membership number and co-operative bylaws."
          align="center"
        />

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p>Didn&apos;t receive the email? Check spam or resend below.</p>
          <p className="mt-2">
            In development, the verification link is also printed in the server console.
          </p>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              const result = await resendCoopVerificationFn();
              if (result && "error" in result && result.error) {
                toast.error(result.error);
              } else {
                toast.success("Verification email resent.");
              }
            } catch {
              toast.error("Could not resend email.");
            } finally {
              setPending(false);
            }
          }}
          className="mt-6 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium hover:bg-muted/50 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Resend verification email"}
        </button>
      </div>
    </section>
  );
}
