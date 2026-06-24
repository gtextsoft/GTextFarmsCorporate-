import { Link, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";
import {
  Bell,
  CirclePlus,
  Coins,
  LayoutDashboard,
  Receipt,
  Sprout,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";

import { SidebarShell, type ShellNavItem } from "@/components/SidebarShell";
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

  const navItems: ShellNavItem[] = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/app/investments", label: "Investments", icon: Coins },
    { to: "/app/wallet", label: "Wallet", icon: Wallet },
    { to: "/app/reports", label: "Transactions", icon: Receipt },
    { to: "/app/activity", label: "Farm updates", icon: Sprout },
    { to: "/app/performance", label: "Performance", icon: TrendingUp },
    { to: "/app/notifications", label: "Notifications", icon: Bell, badge: unreadNotifications },
    { to: "/opportunities", label: "Invest", icon: CirclePlus },
    { to: "/app/profile", label: "Profile", icon: User },
  ];

  const headerRight =
    user?.kycStatus !== "verified" ? (
      <Link
        to="/auth/kyc"
        className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
      >
        Complete KYC
      </Link>
    ) : undefined;

  return (
    <SidebarShell
      homeTo="/app"
      brandTitle="GText Farms"
      brandSubtitle="Investor portal"
      navItems={navItems}
      headerTitle="Investor dashboard"
      userName={user?.fullName}
      headerRight={headerRight}
    />
  );
}
