import { Link, Outlet, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";

import { Logo } from "@/components/marketing/Logo";
import { signOutFn } from "@/lib/api/auth.functions";

function isAdminRole(role: string | undefined) {
  return role === "admin" || role === "super_admin";
}

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth/sign-in" });
    }
    if (!isAdminRole(context.user.role)) {
      throw redirect({ to: "/app" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useRouteContext({ from: "__root__" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-bone/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">GText Farms Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">
              Overview
            </Link>
            <Link to="/admin/investors" className="text-muted-foreground hover:text-foreground">
              Investors
            </Link>
            <Link to="/admin/farms" className="text-muted-foreground hover:text-foreground">
              Farms
            </Link>
            <Link to="/admin/cycles" className="text-muted-foreground hover:text-foreground">
              Cycles
            </Link>
            <Link to="/admin/performance" className="text-muted-foreground hover:text-foreground">
              Performance
            </Link>
            <Link to="/admin/products" className="text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <Link to="/admin/gallery" className="text-muted-foreground hover:text-foreground">
              Gallery
            </Link>
            <Link to="/admin/faq" className="text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
            <Link to="/admin/team" className="text-muted-foreground hover:text-foreground">
              Team
            </Link>
            <Link to="/admin/withdrawals" className="text-muted-foreground hover:text-foreground">
              Withdrawals
            </Link>
            <Link to="/admin/reports" className="text-muted-foreground hover:text-foreground">
              Reports
            </Link>
            <Link to="/admin/analytics" className="text-muted-foreground hover:text-foreground">
              Analytics
            </Link>
            <Link to="/field" className="text-muted-foreground hover:text-foreground">
              Field
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Public site
            </Link>
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
