import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { coopSignInFn } from "@/lib/api/coop.functions";
import { getCoopMemberHomePath, isCoopOnboardingComplete } from "@/lib/coop-membership";
import { handleClientRedirect } from "@/lib/client-redirect";

export const Route = createFileRoute("/co-operative/login")({
  beforeLoad: ({ context }) => {
    const user = context.user;
    if (user?.cooperativeMember && isCoopOnboardingComplete(user.membershipStatus)) {
      throw redirect({ to: getCoopMemberHomePath(user) });
    }
  },
  head: () => ({ meta: [{ title: "Sign In — GText Co-operative" }] }),
  component: CoopLoginPage,
});

function CoopLoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-md">
        <SectionHeader
          eyebrow="Member sign in"
          title="Welcome back."
          sub="Sign in to continue your co-operative membership or investment journey."
        />

        <form
          className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError(null);
            const form = new FormData(e.currentTarget);
            try {
              const result = await coopSignInFn({
                data: {
                  email: String(form.get("email")),
                  password: String(form.get("password")),
                },
              });
              if (result && "error" in result && result.error) {
                setError(result.error);
                toast.error(result.error);
              }
            } catch (err) {
              if (await handleClientRedirect(router, err)) return;
              toast.error("Something went wrong. Please try again.");
            } finally {
              setPending(false);
            }
          }}
        >
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
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
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
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
          New member?{" "}
          <Link to="/co-operative/register" className="font-medium text-forest-deep hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </section>
  );
}
