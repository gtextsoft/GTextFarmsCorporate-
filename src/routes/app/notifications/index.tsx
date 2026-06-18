import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  getMyNotificationsFn,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "@/lib/api/notifications.functions";

export const Route = createFileRoute("/app/notifications/")({
  head: () => ({ meta: [{ title: "Notifications — GText Farms" }] }),
  loader: () => getMyNotificationsFn(),
  component: NotificationsPage,
});

function NotificationsPage() {
  const router = useRouter();
  const notifications = Route.useLoaderData();
  const [pending, setPending] = useState(false);

  if ("error" in notifications) {
    return (
      <main className="px-6 py-12">
        <p className="text-muted-foreground">{notifications.error}</p>
      </main>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Notifications"
            title="Your updates."
            sub="Deposits, investments, KYC, farm reports, and withdrawal status."
          />
          {unread > 0 && (
            <button
              type="button"
              disabled={pending}
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
              className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No notifications yet. Activity from your wallet and investments will appear here.
          </p>
        ) : (
          <ul className="mt-10 space-y-3">
            {notifications.map((item) => (
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
  onRead: () => void;
}) {
  const inner = (
    <article
      className={`rounded-2xl border p-5 shadow-soft transition ${
        item.read
          ? "border-border bg-card"
          : "border-forest/30 bg-forest/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-forest-deep">
            {item.type.replace("_", " ")}
          </p>
          <h3 className="mt-1 font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
        </div>
        {!item.read && <span className="size-2 shrink-0 rounded-full bg-accent" />}
      </div>
      <time className="mt-3 block text-xs text-muted-foreground">
        {new Date(item.createdAt).toLocaleString("en-NG")}
      </time>
    </article>
  );

  if (item.link) {
    return (
      <Link to={item.link} onClick={onRead} className="block hover:opacity-90">
        {inner}
      </Link>
    );
  }

  return <div onClick={onRead}>{inner}</div>;
}
