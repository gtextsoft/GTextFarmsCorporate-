import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/marketing/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { signOutFn } from "@/lib/api/auth.functions";

export type ShellNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  exact?: boolean;
  external?: boolean;
};

function ShellNavLink({ item }: { item: ShellNavItem }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = item.external
    ? false
    : item.exact
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link
          to={item.to}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noreferrer" : undefined}
        >
          <Icon />
          <span>{item.label}</span>
          {item.external && <ExternalLink className="ml-auto size-3 opacity-60" />}
          {item.badge != null && item.badge > 0 && (
            <SidebarMenuBadge>{item.badge > 9 ? "9+" : item.badge}</SidebarMenuBadge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Shared responsive sidebar shell for the authenticated portals (investor, co-operative,
 * field). Built on the same shadcn sidebar primitive as the admin AdminShell, so it
 * collapses to a slide-in drawer with a hamburger trigger on mobile.
 */
export function SidebarShell({
  homeTo,
  brandTitle,
  brandSubtitle,
  navItems,
  footerItems = [],
  headerTitle,
  userName,
  headerRight,
}: {
  homeTo: string;
  brandTitle: string;
  brandSubtitle: string;
  navItems: ShellNavItem[];
  footerItems?: ShellNavItem[];
  headerTitle: string;
  userName?: string;
  headerRight?: ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link to={homeTo} className="flex items-center gap-2 px-2 py-1">
            <Logo />
            <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-sidebar-foreground">{brandTitle}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">{brandSubtitle}</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <ShellNavLink key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            {footerItems.map((item) => (
              <ShellNavLink key={item.to} item={item} />
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => signOutFn()}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{headerTitle}</p>
            {userName && (
              <p className="truncate text-xs text-muted-foreground">Signed in as {userName}</p>
            )}
          </div>
          {headerRight}
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
