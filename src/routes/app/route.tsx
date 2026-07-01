import { Link, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";
import {
  CirclePlus,
  Coins,
  FileText,
  Headphones,
  LayoutDashboard,
  Receipt,
  Settings,
  Sprout,
  TrendingUp,
  User,
  Video,
  Wallet,
} from "lucide-react";

import { PortalShell, type PortalNavItem } from "@/components/portal/PortalShell";
import { getUnreadNotificationCountFn } from "@/lib/api/notifications.functions";

const APP_NAV: PortalNavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/investments", label: "Investments", icon: Coins },
  { to: "/app/wallet", label: "Wallet", icon: Wallet },
  { to: "/app", label: "View Farm Live", icon: Video, hash: "cctv" },
  { to: "/app/activity", label: "Farm Updates", icon: Sprout },
  { to: "/app", label: "Reports", icon: FileText, hash: "performance" },
  { to: "/app/reports", label: "Transactions", icon: Receipt },
  { to: "/app/performance", label: "Performance", icon: TrendingUp },
  { to: "/app/invest", label: "Invest", icon: CirclePlus },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/profile", label: "Settings", icon: Settings },
  { to: "/app", label: "Support", icon: Headphones, hash: "support" },
];

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

  const navItems = APP_NAV;

  return (
    <PortalShell
      homeTo="/app"
      brandLine1="GText Farms"
      brandLine2="Investor Portal"
      navItems={navItems}
      userName={user?.fullName}
      userRole="Investor"
      headerSubtitle="GText Farms Africa — Investor Portal"
      notificationCount={unreadNotifications}
      notificationTo="/app/notifications"
      headerAction={
        user?.kycStatus !== "verified" ? (
          <Link
            to="/auth/kyc"
            className="hidden rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-forest-deep sm:inline-flex"
          >
            Complete KYC
          </Link>
        ) : undefined
      }
      menuItems={[
        { label: "Profile", to: "/app/profile" },
        { label: "Fund wallet", to: "/app/wallet" },
      ]}
    />
  );
}
