import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { requestPasswordResetFn } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — GText Farms" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <SectionHeader
            eyebrow="Account recovery"
            title="Reset your password."
            sub="Enter the email on your account. We'll send a reset link if it exists."
          />

          {sent ? (
            <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-soft">
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, a reset link has been sent. Check your inbox
                and spam folder.
              </p>
              <Link
                to="/auth/sign-in"
                className="mt-6 inline-flex text-sm font-medium text-forest-deep hover:underline"
              >
                Back to sign in
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
                  await requestPasswordResetFn({
                    data: { email: String(form.get("email")) },
                  });
                  setSent(true);
                  toast.success("Check your email for a reset link");
                } catch {
                  toast.error("Could not send reset email");
                } finally {
                  setPending(false);
                }
              }}
            >
              <label className="block text-sm">
                <span className="font-medium">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/auth/sign-in" className="font-medium text-forest-deep hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
