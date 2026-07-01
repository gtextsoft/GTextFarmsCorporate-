import { Link, useRouter } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "@/lib/api/notifications.functions";
import { cn } from "@/lib/utils";

export type NotificationPreview = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

function relativeTime(value: string) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function typeLabel(type: string) {
  return type.replace(/_/g, " ");
}

export function NotificationBellDropdown({
  notifications,
  unreadCount,
  viewAllTo = "/app/notifications",
}: {
  notifications: NotificationPreview[];
  unreadCount: number;
  viewAllTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function refresh() {
    await router.invalidate();
  }

  async function handleMarkRead(notificationId: string) {
    await markNotificationReadFn({ data: { notificationId } });
    await refresh();
  }

  async function handleMarkAllRead() {
    setPending(true);
    try {
      const result = await markAllNotificationsReadFn();
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        await refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,380px)] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={pending}
              onClick={() => void handleMarkAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[min(60vh,420px)]">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Wallet and investment updates will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((item) => (
                <li key={item.id}>
                  <NotificationPreviewItem
                    item={item}
                    onActivate={async () => {
                      if (!item.read) await handleMarkRead(item.id);
                      setOpen(false);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" className="w-full justify-center rounded-lg text-sm">
            <Link to={viewAllTo} onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationPreviewItem({
  item,
  onActivate,
}: {
  item: NotificationPreview;
  onActivate: () => void | Promise<void>;
}) {
  const content = (
  <>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            item.read ? "bg-transparent" : "bg-forest-deep",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm leading-snug", !item.read && "font-semibold")}>
              {item.title}
            </p>
            <time className="shrink-0 text-[10px] text-muted-foreground">
              {relativeTime(item.createdAt)}
            </time>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
          <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-forest-deep/80">
            {typeLabel(item.type)}
          </p>
        </div>
      </div>
    </>
  );

  const className = cn(
    "block w-full px-4 py-3 text-left transition hover:bg-muted/50",
    !item.read && "bg-forest/5",
  );

  if (item.link) {
    return (
      <Link to={item.link} className={className} onClick={() => void onActivate()}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={() => void onActivate()}>
      {content}
    </button>
  );
}
