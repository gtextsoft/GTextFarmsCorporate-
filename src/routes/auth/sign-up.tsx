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
    <AuthShell
      variant="sign-up"
      eyebrow="Get started"
      title="Create your account"
      subtitle="Takes under 5 minutes. You'll complete KYC next before investing."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="font-semibold text-forest-deep hover:underline">
            Sign in
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
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Ada Okafor"
              className="mt-1.5"
            />
          </div>

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

          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="08012345678"
              required
              autoComplete="tel"
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Required for SMS alerts on deposits, investments, and withdrawals
            </p>
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters"
          />

          <Button type="submit" disabled={pending} className="w-full rounded-xl">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link to="/legal/terms" className="text-forest-deep hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/legal/investment-agreement" className="text-forest-deep hover:underline">
              Investment Agreement
            </Link>
            .
          </p>
        </form>
      </AuthFormCard>

      <div className="mt-6">
        <AuthTrustNote />
      </div>
    </AuthShell>
  );
}
