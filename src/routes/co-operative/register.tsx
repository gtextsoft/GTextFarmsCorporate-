import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { isRedirect } from "@tanstack/react-router";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { coopRegisterFn } from "@/lib/api/coop.functions";

export const Route = createFileRoute("/co-operative/register")({
  beforeLoad: ({ context }) => {
    if (context.user?.cooperativeMember) {
      throw redirect({ to: "/co-operative/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Register — GText Co-operative" }] }),
  component: CoopRegisterPage,
});

function CoopRegisterPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-md">
        <SectionHeader
          eyebrow="New member"
          title="Join the co-operative."
          sub="Welcome to GText Farms Co-operative Society. Register to become a member — your membership number and bylaws will be sent after you verify your email."
        />

        <form
          className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError(null);
            const form = new FormData(e.currentTarget);
            try {
              const result = await coopRegisterFn({
                data: {
                  firstName: String(form.get("firstName")),
                  lastName: String(form.get("lastName")),
                  email: String(form.get("email")),
                  password: String(form.get("password")),
                  confirmPassword: String(form.get("confirmPassword")),
                },
              });
              if (result && "error" in result && result.error) {
                setError(result.error);
                toast.error(result.error);
              }
            } catch (err) {
              if (isRedirect(err)) throw err;
              toast.error("Something went wrong. Please try again.");
            } finally {
              setPending(false);
            }
          }}
        >
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                autoComplete="given-name"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                autoComplete="family-name"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
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
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Repeat password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/co-operative/login" className="font-medium text-forest-deep hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
