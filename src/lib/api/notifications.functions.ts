import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { withDatabase } from "@/lib/with-database";

async function requireUserId() {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };
  return { userId: session.data.userId };
}

export const getMyNotificationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  return withDatabase(async () => {
    const { Notification } = await import("@/lib/models/notification.model.server");
    const docs = await Notification.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      type: doc.type,
      title: doc.title,
      body: doc.body,
      link: doc.link ?? undefined,
      read: doc.read,
      createdAt: doc.createdAt?.toISOString() ?? "",
    }));
  }, []);
});

export const getUnreadNotificationCountFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error, count: 0 };

  return withDatabase(async () => {
    const { Notification } = await import("@/lib/models/notification.model.server");
    const count = await Notification.countDocuments({ userId: auth.userId, read: false });
    return { count };
  }, { count: 0 });
});

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator(z.object({ notificationId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireUserId();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Notification } = await import("@/lib/models/notification.model.server");

    await connectDB();
    await Notification.updateOne(
      { _id: data.notificationId, userId: auth.userId },
      { $set: { read: true } },
    );
    return { success: true as const };
  });

export const markAllNotificationsReadFn = createServerFn({ method: "POST" }).handler(async () => {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Notification } = await import("@/lib/models/notification.model.server");

  await connectDB();
  await Notification.updateMany({ userId: auth.userId, read: false }, { $set: { read: true } });
  return { success: true as const };
});
