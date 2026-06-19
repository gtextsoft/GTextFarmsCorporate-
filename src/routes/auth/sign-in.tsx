import { Link, createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { signInFn } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      if (context.user.role === "admin" || context.user.role === "super_admin") {
        throw redirect({ to: "/admin" });
      }
      if (context.user.role === "field_officer") {
        throw redirect({ to: "/field" });
      }
      throw redirect({
        to: context.user.kycStatus === "verified" ? "/app" : "/auth/kyc",
      });
    }
  },
  head: () => ({ meta: [{ title: "Sign In — GText Farms" }] }),
  component: SignInPage,
});

function SignInPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <SectionHeader
            eyebrow="Investor access"
            title="Sign in to your account."
            sub="Track your investments, wallet, and weekly farm reports."
          />

          <form
            className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              setError(null);
              const form = new FormData(e.currentTarget);
              try {
                const result = await signInFn({
                  data: {
                    email: String(form.get("email")),
                    password: String(form.get("password")),
                  },
                });
                if (result?.error) {
                  setError(result.error);
                  toast.error(result.error);
                }
              } catch (err) {
                if (isRedirect(err)) throw err;
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-forest-deep hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/auth/sign-up" className="font-medium text-forest-deep hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
