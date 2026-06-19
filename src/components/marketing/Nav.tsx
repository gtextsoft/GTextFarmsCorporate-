import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/marketing/Logo";
import { brand } from "@/lib/brand";

export function Nav() {
  const { user } = useRouteContext({ from: "__root__" });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-base font-semibold tracking-tight">{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" hash="how" className="hover:text-foreground">
            How it works
          </Link>
          <Link to="/performance" className="hover:text-foreground">
            Track record
          </Link>
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          <Link to="/gallery" className="hover:text-foreground">
            Gallery
          </Link>
          <Link to="/news" className="hover:text-foreground">
            News
          </Link>
          <Link to="/farms" className="hover:text-foreground">
            Live farms
          </Link>
          <Link to="/opportunities" className="hover:text-foreground">
            Opportunities
          </Link>
          <Link to="/" hash="faq" className="hover:text-foreground">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/app"
              className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline-block"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/sign-in"
              className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline-block"
            >
              Sign in
            </Link>
          )}
          <Link
            to={user ? "/app" : "/opportunities"}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {user ? "My portfolio" : "Start investing"}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
