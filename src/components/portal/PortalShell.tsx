import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, Gift, LogOut, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Logo } from "@/components/marketing/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useSignOut } from "@/hooks/use-sign-out";
import { cn } from "@/lib/utils";

export type PortalNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  hash?: string;
  badge?: number;
};

export const portalSidebarStyle = {
  "--sidebar": "var(--forest-deep)",
  "--sidebar-foreground": "oklch(0.98 0.01 150)",
  "--sidebar-primary": "var(--lime)",
  "--sidebar-primary-foreground": "var(--forest-deep)",
  "--sidebar-accent": "oklch(0.38 0.1 150)",
  "--sidebar-accent-foreground": "oklch(0.98 0.01 150)",
  "--sidebar-border": "oklch(1 0 0 / 12%)",
  "--sidebar-ring": "var(--lime)",
} as CSSProperties;

function PortalNavLink({ item }: { item: PortalNavItem }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const isActive = item.exact
    ? pathname === item.to && !item.hash
    : item.hash
      ? pathname === item.to && hash === item.hash
      : pathname === item.to || pathname.startsWith(`${item.to}/`);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={cn(
          "h-10 rounded-lg text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          isActive && "bg-sidebar-accent font-medium text-sidebar-foreground shadow-sm",
        )}
      >
        <Link to={item.to} hash={item.hash}>
          <Icon className="size-[18px] shrink-0 opacity-90" />
          <span className="text-sm">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <SidebarMenuBadge className="bg-lime text-forest-deep">
              {item.badge > 9 ? "9+" : item.badge}
            </SidebarMenuBadge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function initials(name?: string, fallback = "U") {
  if (!name) return fallback;
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PortalShell({
  homeTo,
  brandLine1,
  brandLine2,
  navItems,
  userName,
  userRole = "Member",
  avatarUrl,
  headerSubtitle,
  notificationCount = 0,
  messageCount = 0,
  notificationTo,
  showReferEarn = false,
  menuItems,
  headerAction,
  children,
}: {
  homeTo: string;
  brandLine1: string;
  brandLine2: string;
  navItems: PortalNavItem[];
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  headerSubtitle: string;
  notificationCount?: number;
  messageCount?: number;
  notificationTo?: string;
  showReferEarn?: boolean;
  menuItems: { label: string; to: string }[];
  headerAction?: ReactNode;
  children?: ReactNode;
}) {
  const firstName = userName?.split(" ")[0] ?? userRole;
  const { signOut, pending: signingOut } = useSignOut();

  return (
    <SidebarProvider style={portalSidebarStyle}>
      <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
          <Link to={homeTo} className="flex items-start gap-3">
            <Logo className="bg-lime text-forest-deep" />
            <div className="min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/90">
                {brandLine1}
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase leading-snug tracking-wide text-sidebar-foreground/70">
                {brandLine2}
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <PortalNavLink key={`${item.to}-${item.label}`} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-3 border-t border-sidebar-border p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => void signOut()}
                disabled={signingOut}
                className="h-10 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="size-[18px]" />
                <span>{signingOut ? "Signing out…" : "Logout"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {showReferEarn ? (
            <div className="rounded-xl bg-lime/15 p-4 group-data-[collapsible=icon]:hidden">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-lime/25 text-lime">
                  <Gift className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground">Refer &amp; Earn</p>
                  <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
                    Invite friends and earn rewards when they join.
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-lime px-3 py-1.5 text-xs font-semibold text-forest-deep transition hover:opacity-90"
                  >
                    Refer Now
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[oklch(0.975_0.012_150)]">
        <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-border/60 bg-[oklch(0.975_0.012_150)]/95 px-4 py-4 backdrop-blur md:px-8">
          <SidebarTrigger className="-ml-1 text-forest-deep md:hidden" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Welcome back, {firstName}{" "}
              <span aria-hidden className="inline-block">
                👋
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{headerSubtitle}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {headerAction}
            {notificationTo ? (
              <Link
                to={notificationTo}
                className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
                aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}
              >
                <Bell className="size-[18px]" />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                type="button"
                className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
                aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}
              >
                <Bell className="size-[18px]" />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              className="relative hidden size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground sm:grid"
              aria-label={`Messages${messageCount ? `, ${messageCount} unread` : ""}`}
            >
              <Mail className="size-[18px]" />
              {messageCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {messageCount > 9 ? "9+" : messageCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition hover:bg-secondary sm:pr-3"
                >
                  <Avatar className="size-9">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={userName ?? userRole} /> : null}
                    <AvatarFallback className="bg-forest text-xs font-semibold text-primary-foreground">
                      {initials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block truncate text-sm font-medium leading-tight">
                      {userName ?? userRole}
                    </span>
                    <span className="block text-xs text-muted-foreground">{userRole}</span>
                  </span>
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void signOut()}
                  disabled={signingOut}
                  className="text-destructive"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-5rem)] flex-1 flex-col">
          {children ?? <Outlet />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
