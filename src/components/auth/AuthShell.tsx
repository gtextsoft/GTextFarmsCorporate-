import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Sprout, TrendingUp, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/marketing/Logo";
import { brand } from "@/lib/brand";
import { imagePaths } from "@/lib/image-paths";
import { cn } from "@/lib/utils";

const DEFAULT_HIGHLIGHTS = [
  {
    icon: Sprout,
    title: "Verified farm cycles",
    description: "Invest in poultry production with transparent weekly field reports.",
  },
  {
    icon: Wallet,
    title: "Wallet & Paystack",
    description: "Fund your account securely and invest directly from your balance.",
  },
  {
    icon: TrendingUp,
    title: "Track performance",
    description: "Monitor mortality, production, and returns from your investor portal.",
  },
] as const;

const SIGNUP_STEPS = [
  { label: "Create account", done: true },
  { label: "Complete KYC", done: false },
  { label: "Fund & invest", done: false },
] as const;

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  variant = "sign-in",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "sign-in" | "sign-up";
}) {
  return (
    <div className="min-h-screen bg-[oklch(0.975_0.012_150)]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-forest-deep lg:flex lg:flex-col">
          <img
            src={imagePaths.heroFarm}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-forest-deep via-forest-deep/95 to-forest/80" />

          <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="flex items-center gap-3 text-primary-foreground">
              <Logo className="bg-lime text-forest-deep" />
              <div>
                <p className="font-semibold leading-tight">{brand.name}</p>
                <p className="text-xs text-primary-foreground/70">Investor Portal</p>
              </div>
            </Link>

            <div className="max-w-md">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-lime/90">
                {brand.tagline}
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-primary-foreground xl:text-4xl">
                {variant === "sign-up"
                  ? "Start investing in real Nigerian farms."
                  : "Welcome back to your portfolio."}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
                {brand.investSubheadline}
              </p>

              {variant === "sign-up" && (
                <ol className="mt-8 space-y-3">
                  {SIGNUP_STEPS.map((step, index) => (
                    <li key={step.label} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "grid size-7 place-items-center rounded-full text-xs font-semibold",
                          index === 0
                            ? "bg-lime text-forest-deep"
                            : "border border-primary-foreground/25 text-primary-foreground/70",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={
                          index === 0 ? "font-medium text-primary-foreground" : "text-primary-foreground/70"
                        }
                      >
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <ul className="space-y-4">
              {DEFAULT_HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-foreground/10 text-lime">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary-foreground">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/65">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
              <Logo className="bg-forest-deep text-primary-foreground" />
              <span className="font-semibold text-forest-deep">{brand.name}</span>
            </Link>

            <div className="mb-8 flex items-center gap-2 rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-xs text-muted-foreground lg:hidden">
              <ShieldCheck className="size-4 shrink-0 text-forest-deep" />
              Secure investor access · NDPR compliant
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl text-forest-deep">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthTrustNote() {
  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-forest-deep" />
      Your data is encrypted in transit. We never share your identity documents without consent.
    </p>
  );
}
