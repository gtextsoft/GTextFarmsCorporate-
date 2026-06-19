import { Link, Outlet, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";

import { Logo } from "@/components/marketing/Logo";
import { signOutFn } from "@/lib/api/auth.functions";
import { getUnreadNotificationCountFn } from "@/lib/api/notifications.functions";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  loader: async () => {
    const result = await getUnreadNotificationCountFn();
    return {
      unreadNotifications: "error" in result ? 0 : result.count,
    };
  },
  component: AppLayout,
});

function AppLayout() {
  const { user } = useRouteContext({ from: "__root__" });
  const { unreadNotifications } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-bone/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/app" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">GText Farms</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/app" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/app/investments" className="text-muted-foreground hover:text-foreground">
              Investments
            </Link>
            <Link to="/app/wallet" className="text-muted-foreground hover:text-foreground">
              Wallet
            </Link>
            <Link to="/app/reports" className="text-muted-foreground hover:text-foreground">
              Transactions
            </Link>
            <Link to="/app/activity" className="text-muted-foreground hover:text-foreground">
              Farm updates
            </Link>
            <Link to="/app/performance" className="text-muted-foreground hover:text-foreground">
              Performance
            </Link>
            <Link
              to="/app/notifications"
              className="relative text-muted-foreground hover:text-foreground"
            >
              Notifications
              {unreadNotifications > 0 && (
                <span className="absolute -right-3 -top-2 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
            <Link to="/opportunities" className="text-muted-foreground hover:text-foreground">
              Invest
            </Link>
            <Link to="/app/profile" className="text-muted-foreground hover:text-foreground">
              Profile
            </Link>
            {user?.kycStatus !== "verified" && (
              <Link
                to="/auth/kyc"
                className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
              >
                Complete KYC
              </Link>
            )}
            <span className="hidden text-muted-foreground sm:inline">{user?.fullName}</span>
            <button
              type="button"
              onClick={() => signOutFn()}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
