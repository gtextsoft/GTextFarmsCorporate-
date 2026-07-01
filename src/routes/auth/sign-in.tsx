import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthFormCard, PasswordField } from "@/components/auth/AuthForm";
import { AuthShell, AuthTrustNote } from "@/components/auth/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInFn } from "@/lib/api/auth.functions";
import { handleClientRedirect } from "@/lib/client-redirect";
import { privatePageHead } from "@/lib/seo";

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
  head: () => privatePageHead("/auth/sign-in", "Sign In"),
  component: SignInPage,
});

function SignInPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell
      variant="sign-in"
      eyebrow="Investor access"
      title="Sign in"
      subtitle="Track your investments, wallet balance, and weekly farm reports."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/auth/sign-up" className="font-semibold text-forest-deep hover:underline">
            Create one free
          </Link>
        </p>
      }
    >
      <AuthFormCard>
        <form
          className="space-y-5"
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
              if (await handleClientRedirect(router, err)) return;
              console.error(err);
              toast.error("Something went wrong. Please try again.");
            } finally {
              setPending(false);
            }
          }}
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1.5"
            />
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            labelAction={
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-forest-deep hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          <Button type="submit" disabled={pending} className="w-full rounded-xl">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </AuthFormCard>

      <div className="mt-6">
        <AuthTrustNote />
      </div>
    </AuthShell>
  );
}
