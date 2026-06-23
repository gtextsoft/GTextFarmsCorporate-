import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  ExternalLink,
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Newspaper,
  Package,
  RefreshCw,
  Shield,
  Sprout,
  Tractor,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/marketing/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

type QueueCounts = {
  submittedKyc: number;
  newInquiries: number;
  pendingWithdrawals: number;
  pendingReports: number;
} | null;

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  exact?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Co-operative",
    items: [{ to: "/admin/cooperative/members", label: "Members", icon: Shield }],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/investors", label: "Investors", icon: Users },
      { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
      { to: "/admin/withdrawals", label: "Withdrawals", icon: CircleDollarSign },
      { to: "/admin/reports", label: "Field reports", icon: FileText },
    ],
  },
  {
    label: "Farms",
    items: [
      { to: "/admin/farms", label: "Farms", icon: Sprout },
      { to: "/admin/cycles", label: "Cycles", icon: RefreshCw },
      { to: "/admin/performance", label: "Performance", icon: TrendingUp },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/gallery", label: "Gallery", icon: Image },
      { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
      { to: "/admin/team", label: "Team", icon: Users },
      { to: "/admin/news", label: "News", icon: Newspaper },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/audit", label: "Audit log", icon: Shield },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/staff", label: "Staff", icon: UserCog },
      { to: "/admin/profile", label: "Profile", icon: Building2 },
    ],
  },
];

function badgeForItem(to: string, queue: QueueCounts): number | undefined {
  if (!queue) return undefined;
  switch (to) {
    case "/admin/investors":
      return queue.submittedKyc || undefined;
    case "/admin/inquiries":
      return queue.newInquiries || undefined;
    case "/admin/withdrawals":
      return queue.pendingWithdrawals || undefined;
    case "/admin/reports":
      return queue.pendingReports || undefined;
    default:
      return undefined;
  }
}

function AdminNavLink({ item, queue }: { item: NavItem; queue: QueueCounts }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = item.exact
    ? pathname === item.to
    : pathname === item.to || pathname.startsWith(`${item.to}/`);
  const badge = item.badge ?? badgeForItem(item.to, queue);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link to={item.to}>
          <Icon />
          <span>{item.label}</span>
          {badge != null && badge > 0 && (
            <SidebarMenuBadge>{badge > 9 ? "9+" : badge}</SidebarMenuBadge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function FooterLink({
  to,
  icon: Icon,
  children,
  external,
}: {
  to: string;
  icon: LucideIcon;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to={to} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
          <Icon />
          <span>{children}</span>
          {external && <ExternalLink className="ml-auto size-3 opacity-60" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminShell({
  userName,
  queue,
}: {
  userName?: string;
  queue: QueueCounts;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-2 px-2 py-1">
            <Logo />
            <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-sidebar-foreground">GText Farms</span>
              <span className="truncate text-xs text-sidebar-foreground/70">Admin portal</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <AdminNavLink key={item.to} item={item} queue={queue} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <FooterLink to="/field" icon={Tractor}>
              Field portal
            </FooterLink>
            <FooterLink to="/" icon={ExternalLink} external>
              Public site
            </FooterLink>
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
            <p className="truncate text-sm font-medium">Admin dashboard</p>
            {userName && (
              <p className="truncate text-xs text-muted-foreground">Signed in as {userName}</p>
            )}
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
