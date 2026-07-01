import { Link, Outlet, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";

import { Logo } from "@/components/marketing/Logo";
import { useSignOut } from "@/hooks/use-sign-out";
import {
  COOP_PUBLIC_PATHS,
  getCoopMemberHomePath,
  getCoopRequiredPath,
  isCoopOnboardingComplete,
} from "@/lib/coop-membership";

export const Route = createFileRoute("/co-operative")({
  beforeLoad: ({ context, location }) => {
    const user = context.user;
    const path = location.pathname;

    if (path === "/co-operative/dashboard" || path.startsWith("/co-operative/dashboard/")) {
      throw redirect({
        to: user ? getCoopMemberHomePath(user) : "/co-operative/login",
      });
    }

    if (!user) {
      const isPublic = COOP_PUBLIC_PATHS.some(
        (p) => path === p || path.startsWith(`${p}/`),
      );
      if (!isPublic) {
        throw redirect({ to: "/co-operative/login" });
      }
      return;
    }

    if (!user.cooperativeMember) {
      if (path.startsWith("/co-operative/register") || path.startsWith("/co-operative/login") || path === "/co-operative") {
        return;
      }
      throw redirect({ to: "/co-operative" });
    }

    const required = getCoopRequiredPath(user);
    const onboardingDone = isCoopOnboardingComplete(user.membershipStatus);

    if (required && path !== required && !path.startsWith("/co-operative/verify")) {
      throw redirect({ to: required });
    }

    if (onboardingDone && (path === "/co-operative/register" || path === "/co-operative/login")) {
      throw redirect({ to: getCoopMemberHomePath(user) });
    }
  },
  component: CoopLayout,
});

function CoopLayout() {
  const { user } = useRouteContext({ from: "__root__" });
  const { signOut, pending: signingOut } = useSignOut();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-bone/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/co-operative" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">GText Co-operative</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {isCoopOnboardingComplete(user.membershipStatus) ? (
                <Link
                  to="/app"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Investor portal
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={signingOut}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="flex gap-3 text-sm">
              <Link to="/co-operative/login" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link
                to="/co-operative/register"
                className="rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
