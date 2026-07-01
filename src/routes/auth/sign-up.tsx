import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { signUpFn } from "@/lib/api/auth.functions";
import { handleClientRedirect } from "@/lib/client-redirect";

export const Route = createFileRoute("/auth/sign-up")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: context.user.kycStatus === "verified" ? "/app" : "/auth/kyc" });
    }
  },
  head: () => ({ meta: [{ title: "Create Account — GText Farms" }] }),
  component: SignUpPage,
});

function SignUpPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <SectionHeader
            eyebrow="Get started"
            title="Create your investor account."
            sub="Takes under 5 minutes. Complete KYC next to start investing."
          />

          <form
            className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              setError(null);
              const form = new FormData(e.currentTarget);
              try {
                const result = await signUpFn({
                  data: {
                    fullName: String(form.get("fullName")),
                    email: String(form.get("email")),
                    phone: String(form.get("phone") || undefined),
                    password: String(form.get("password")),
                  },
                });
                if (result?.error) {
                  setError(result.error);
                  toast.error(result.error);
                }
              } catch (err) {
                if (await handleClientRedirect(router, err)) return;
                console.error(err);
                toast.error("Something went wrong. Please try again.");
              } finally {
                setPending(false);
              }
            }}
          >
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="fullName" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
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
                placeholder="08012345678"
                required
                autoComplete="tel"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">Required for SMS account alerts</p>
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/sign-in" className="font-medium text-forest-deep hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
