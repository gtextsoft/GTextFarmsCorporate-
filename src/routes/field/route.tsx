import { Link, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";
import { FilePlus, FileText, Shield, User } from "lucide-react";

import { SidebarShell, type ShellNavItem } from "@/components/SidebarShell";
import { privatePageHead } from "@/lib/seo";

function isFieldRole(role: string | undefined) {
  return role === "field_officer" || role === "admin" || role === "super_admin";
}

export const Route = createFileRoute("/field")({
  head: () => privatePageHead("/field", "Field Portal"),
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
    if (!isFieldRole(context.user.role)) {
      throw redirect({ to: "/app" });
    }
  },
  component: FieldLayout,
});

function FieldLayout() {
  const { user } = useRouteContext({ from: "__root__" });
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const navItems: ShellNavItem[] = [
    { to: "/field", label: "My reports", icon: FileText, exact: true },
    { to: "/field/profile", label: "Profile", icon: User },
  ];

  const footerItems: ShellNavItem[] = isAdmin
    ? [{ to: "/admin", label: "Admin", icon: Shield }]
    : [];

  const headerRight = (
    <Link
      to="/field/reports/new"
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
    >
      <FilePlus className="size-3.5" />
      New report
    </Link>
  );

  return (
    <SidebarShell
      homeTo="/field"
      brandTitle="GText Farms"
      brandSubtitle="Field portal"
      navItems={navItems}
      footerItems={footerItems}
      headerTitle="Field reports"
      userName={user?.fullName}
      headerRight={headerRight}
    />
  );
}
