import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { resetPasswordFn } from "@/lib/api/auth.functions";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Reset Password — GText Farms" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <MarketingLayout>
        <main className="px-6 py-16">
          <p className="mx-auto max-w-md text-center text-sm text-muted-foreground">
            Invalid reset link.{" "}
            <Link to="/auth/forgot-password" className="text-forest-deep hover:underline">
              Request a new one
            </Link>
            .
          </p>
        </main>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <SectionHeader
            eyebrow="Account recovery"
            title="Choose a new password."
            sub="Must be at least 8 characters."
          />

          <form
            className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const form = new FormData(e.currentTarget);
              try {
                const result = await resetPasswordFn({
                  data: {
                    token,
                    password: String(form.get("password")),
                  },
                });
                if ("error" in result && result.error) {
                  toast.error(result.error);
                } else {
                  toast.success("Password updated — sign in with your new password");
                  await navigate({ to: "/auth/sign-in" });
                }
              } catch {
                toast.error("Could not reset password");
              } finally {
                setPending(false);
              }
            }}
          >
            <label className="block text-sm">
              <span className="font-medium">New password</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
