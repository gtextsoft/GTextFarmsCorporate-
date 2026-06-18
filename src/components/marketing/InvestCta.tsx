import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function InvestCta({ cycleSlug }: { cycleSlug: string }) {
  const { user } = useRouteContext({ from: "__root__" });

  if (!user) {
    return (
      <Link
        to="/auth/sign-up"
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
      >
        Create account to invest
        <ArrowUpRight className="size-4" />
      </Link>
    );
  }

  if (user.kycStatus !== "verified") {
    return (
      <>
        <p className="mt-4 text-xs text-muted-foreground">
          {user.kycStatus === "submitted"
            ? "KYC under review — you'll be able to invest once approved."
            : "Complete identity verification before investing."}
        </p>
        <Link
          to="/auth/kyc"
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          {user.kycStatus === "submitted" ? "View KYC status" : "Complete KYC"}
          <ArrowUpRight className="size-4" />
        </Link>
      </>
    );
  }

  return (
    <Link
      to="/app/invest/$cycleId"
      params={{ cycleId: cycleSlug }}
      className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
    >
      Invest in this cycle
      <ArrowUpRight className="size-4" />
    </Link>
  );
}
