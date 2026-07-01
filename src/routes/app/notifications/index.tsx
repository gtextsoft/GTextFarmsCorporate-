import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMyNotificationsFn,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "@/lib/api/notifications.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications/")({
  head: () => ({ meta: [{ title: "Notifications — GText Farms" }] }),
  loader: () => getMyNotificationsFn(),
  component: NotificationsPage,
});

type Filter = "all" | "unread" | "read";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationsPage() {
  const router = useRouter();
  const notifications = Route.useLoaderData();
  const [pending, setPending] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if ("error" in notifications) return [];
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  if ("error" in notifications) {
    return (
      <main className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">{notifications.error}</p>
        </div>
      </main>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest">
              Notifications
            </p>
            <h1 className="mt-2 font-display text-3xl text-forest-deep md:text-4xl">
              Your updates
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Deposits, investments, KYC, farm reports, and withdrawal status.
            </p>
          </div>
          {unread > 0 && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              className="shrink-0 rounded-xl"
              onClick={async () => {
                setPending(true);
                try {
                  const result = await markAllNotificationsReadFn();
                  if ("error" in result && result.error) toast.error(result.error);
                  else {
                    toast.success("All marked as read");
                    await router.invalidate();
                  }
                } finally {
                  setPending(false);
                }
              }}
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length > 0 && (
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            className="mt-6"
          >
            <TabsList className="h-auto gap-1 bg-muted/60 p-1">
              <TabsTrigger value="all" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                All
                <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                Unread
                <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {unread}
                </span>
              </TabsTrigger>
              <TabsTrigger value="read" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                Read
                <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {notifications.length - unread}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {notifications.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-10 text-center shadow-soft">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest-deep">
              <Bell className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No notifications yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Activity from your wallet, investments, and farm cycles will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-bone/20 p-8 text-center">
            <p className="text-muted-foreground">No {filter} notifications.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <NotificationCard
                  item={item}
                  onRead={async () => {
                    if (!item.read) {
                      await markNotificationReadFn({ data: { notificationId: item.id } });
                      await router.invalidate();
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function NotificationCard({
  item,
  onRead,
}: {
  item: {
    id: string;
    type: string;
    title: string;
    body: string;
    link?: string;
    read: boolean;
    createdAt: string;
  };
  onRead: () => void | Promise<void>;
}) {
  const inner = (
    <article
      className={cn(
        "rounded-2xl border p-5 shadow-soft transition",
        item.read ? "border-border bg-card" : "border-forest/30 bg-forest/5",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.read ? "read" : "new"} label={item.type.replace(/_/g, " ")} />
            {!item.read && (
              <span className="text-xs font-medium text-forest-deep">Unread</span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          {item.link && (
            <p className="mt-3 text-sm font-medium text-forest-deep">View details →</p>
          )}
        </div>
        {!item.read && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-forest-deep" />}
      </div>
      <time className="mt-4 block text-xs text-muted-foreground">
        {formatDateTime(item.createdAt)}
      </time>
    </article>
  );

  if (item.link) {
    return (
      <Link to={item.link} onClick={() => void onRead()} className="block hover:opacity-95">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className="block w-full text-left" onClick={() => void onRead()}>
      {inner}
    </button>
  );
}
