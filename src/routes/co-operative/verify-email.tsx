import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import { getCoopMemberHomePath } from "@/lib/coop-membership";
import { Input } from "@/components/ui/input";
import {
  getCoopVerificationDevFn,
  resendCoopVerificationFn,
  verifyCoopEmailByCodeFn,
} from "@/lib/api/coop.functions";

export const Route = createFileRoute("/co-operative/verify-email")({
  beforeLoad: ({ context }) => {
    const user = context.user;
    if (user?.membershipStatus && user.membershipStatus !== "registered" && user.membershipStatus !== "email_verified") {
      throw redirect({ to: getCoopMemberHomePath(user) });
    }
  },
  loader: async () => {
    const dev = await getCoopVerificationDevFn();
    return { dev };
  },
  head: () => ({ meta: [{ title: "Verify Email — GText Co-operative" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { dev } = Route.useLoaderData();
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState(dev.expose ? dev.code : "");
  const [copied, setCopied] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [verifyPending, setVerifyPending] = useState(false);

  const showDevCode = dev.expose && devCode;

  async function copyCode() {
    if (!devCode) return;
    try {
      await navigator.clipboard.writeText(devCode);
      setCopied(true);
      toast.success("Verification code copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-lg text-center">
        <SectionHeader
          eyebrow="Almost there"
          title="Verify your email."
          sub={
            showDevCode
              ? "Email delivery is not active yet. Copy your verification code below and enter it to continue."
              : "We sent a verification link to your inbox. Click the link to receive your membership number and co-operative bylaws."
          }
        />

        {showDevCode && (
          <div className="mt-8 rounded-2xl border border-forest/30 bg-forest/5 p-6 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-forest-deep">
              Your verification code
            </p>
            <div className="mt-3 flex items-center gap-3">
              <p className="font-mono text-3xl font-semibold tracking-[0.35em] text-foreground">
                {devCode}
              </p>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Paste the code below to verify. It expires in 24 hours.
            </p>

            <form
              className="mt-5 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const trimmed = code.replace(/\D/g, "").slice(0, 6);
                if (trimmed.length !== 6) {
                  toast.error("Enter the 6-digit verification code.");
                  return;
                }
                setVerifyPending(true);
                try {
                  const result = await verifyCoopEmailByCodeFn({ data: { code: trimmed } });
                  if (result && "error" in result && result.error) {
                    toast.error(result.error);
                  }
                } catch {
                  toast.error("Verification failed. Try again.");
                } finally {
                  setVerifyPending(false);
                }
              }}
            >
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center font-mono text-lg tracking-[0.25em]"
              />
              <button
                type="submit"
                disabled={verifyPending || code.length !== 6}
                className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {verifyPending ? "Verifying…" : "Verify email"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {showDevCode ? (
            <p>When email is enabled, a verification link will be sent to your inbox instead.</p>
          ) : (
            <>
              <p>Didn&apos;t receive the email? Check spam or resend below.</p>
              <p className="mt-2">
                In development, the verification link is also printed in the server console.
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={resendPending}
          onClick={async () => {
            setResendPending(true);
            try {
              const result = await resendCoopVerificationFn();
              if (result && "error" in result && result.error) {
                toast.error(result.error);
              } else {
                if ("code" in result && result.code) {
                  setDevCode(result.code);
                  setCode("");
                }
                toast.success(
                  showDevCode || ("code" in result && result.code)
                    ? "New verification code generated."
                    : "Verification email resent.",
                );
              }
            } catch {
              toast.error("Could not resend verification.");
            } finally {
              setResendPending(false);
            }
          }}
          className="mt-6 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium hover:bg-muted/50 disabled:opacity-60"
        >
          {resendPending ? "Generating…" : showDevCode ? "Get new code" : "Resend verification email"}
        </button>
      </div>
    </section>
  );
}
