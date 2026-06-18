import { connectDB } from "@/lib/db.server";
import { Notification } from "@/lib/models/notification.model.server";

export async function createNotification(params: {
  userId: string;
  type: "deposit" | "investment" | "kyc" | "field_report" | "withdrawal" | "system";
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  await connectDB();
  await Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link,
    metadata: params.metadata,
    read: false,
  });
}

export async function notifySafe(
  fn: () => Promise<void>,
  label: string,
) {
  try {
    await fn();
  } catch (err) {
    console.error(`[notification] ${label} failed:`, err);
  }
}
