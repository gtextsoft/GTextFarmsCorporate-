import { Link, Outlet, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";

import { Logo } from "@/components/marketing/Logo";
import { signOutFn } from "@/lib/api/auth.functions";

function isFieldRole(role: string | undefined) {
  return role === "field_officer" || role === "admin" || role === "super_admin";
}

export const Route = createFileRoute("/field")({
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-bone/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/field" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">Field reports</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/field" className="text-muted-foreground hover:text-foreground">
              My reports
            </Link>
            <Link
              to="/field/reports/new"
              className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              New report
            </Link>
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            )}
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
