import { Link, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";
import {
  CirclePlus,
  Coins,
  Headphones,
  LayoutDashboard,
  Receipt,
  Sprout,
  TrendingUp,
  User,
  Video,
  Wallet,
} from "lucide-react";

import { PortalShell, type PortalNavSection } from "@/components/portal/PortalShell";
import { getUnreadMessageCountFn } from "@/lib/api/messages.functions";
import {
  getRecentNotificationsFn,
  getUnreadNotificationCountFn,
} from "@/lib/api/notifications.functions";

const APP_NAV: PortalNavSection[] = [
  {
    items: [{ to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Investments",
    items: [
      { to: "/app/invest", label: "Invest", icon: CirclePlus },
      { to: "/app/investments", label: "My Investments", icon: Coins },
      { to: "/app/performance", label: "Performance", icon: TrendingUp },
    ],
  },
  {
    label: "Wallet & Payments",
    items: [
      { to: "/app/wallet", label: "Wallet", icon: Wallet },
      { to: "/app/reports", label: "Transactions", icon: Receipt },
    ],
  },
  {
    label: "Farm",
    items: [
      { to: "/app/activity", label: "Farm Updates", icon: Sprout },
      { to: "/app/live", label: "View Farm Live", icon: Video },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/app/profile", label: "Profile", icon: User },
      { to: "/app/support", label: "Support", icon: Headphones },
    ],
  },
];

import { buildPageHead, privatePageHead } from "@/lib/seo";

export const Route = createFileRoute("/app")({
  head: () => privatePageHead("/app", "Investor Portal"),
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  loader: async () => {
    const [countResult, recent, messageCount] = await Promise.all([
      getUnreadNotificationCountFn(),
      getRecentNotificationsFn(),
      getUnreadMessageCountFn(),
    ]);
    return {
      unreadNotifications: "error" in countResult ? 0 : countResult.count,
      recentNotifications: "error" in recent ? [] : recent,
      unreadMessages: "error" in messageCount ? 0 : messageCount.count,
    };
  },
  component: AppLayout,
});

function AppLayout() {
  const { user } = useRouteContext({ from: "__root__" });
  const { unreadNotifications, recentNotifications, unreadMessages } = Route.useLoaderData();

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
      recentNotifications={recentNotifications}
      notificationTo="/app/notifications"
      messageCount={unreadMessages}
      messagesTo="/app/messages"
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
        { label: "Support", to: "/app/support" },
      ]}
    />
  );
}
