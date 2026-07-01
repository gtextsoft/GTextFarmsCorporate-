import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";
import type { ChatMessage } from "@/lib/api/messages.functions";
import { withDatabase } from "@/lib/with-database";

/** Client-safe ObjectId shape check (avoids importing mongoose into this module). */
function isValidObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export type AdminConversation = {
  investorId: string;
  investorName: string;
  investorEmail: string;
  lastBody: string;
  lastSenderRole: "investor" | "admin";
  lastAt: string;
  unread: number;
};

export const getAdminConversationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  return withDatabase(async () => {
    const { Message } = await import("@/lib/models/message.model.server");
    const rows = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$investorId",
          lastBody: { $first: "$body" },
          lastAt: { $first: "$createdAt" },
          lastSenderRole: { $first: "$senderRole" },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$senderRole", "investor"] }, { $eq: ["$readByAdmin", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "investor",
        },
      },
      { $unwind: "$investor" },
    ]);

    return rows.map(
      (row): AdminConversation => ({
        investorId: row._id.toString(),
        investorName: row.investor?.fullName ?? "Investor",
        investorEmail: row.investor?.email ?? "",
        lastBody: row.lastBody ?? "",
        lastSenderRole: row.lastSenderRole,
        lastAt: row.lastAt ? new Date(row.lastAt).toISOString() : "",
        unread: row.unread ?? 0,
      }),
    );
  }, []);
});

export const getAdminThreadFn = createServerFn({ method: "GET" })
  .validator(z.object({ investorId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    if (!isValidObjectId(data.investorId)) {
      return { error: "Invalid investor" as const };
    }

    return withDatabase(
      async () => {
        const { Message } = await import("@/lib/models/message.model.server");
        const { User } = await import("@/lib/models/user.model.server");

        const [investor, docs] = await Promise.all([
          User.findById(data.investorId).lean(),
          Message.find({ investorId: data.investorId }).sort({ createdAt: 1 }).limit(200).lean(),
        ]);

        return {
          investor: {
            id: data.investorId,
            name: investor?.fullName ?? "Investor",
            email: investor?.email ?? "",
          },
          messages: docs.map(
            (doc): ChatMessage => ({
              id: doc._id.toString(),
              senderRole: doc.senderRole as "investor" | "admin",
              body: doc.body,
              createdAt: doc.createdAt?.toISOString() ?? "",
            }),
          ),
        };
      },
      { investor: { id: data.investorId, name: "Investor", email: "" }, messages: [] },
    );
  });

export const adminSendMessageFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      investorId: z.string().min(1),
      body: z.string().trim().min(1, "Message is empty").max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    if (!isValidObjectId(data.investorId)) {
      return { error: "Invalid investor" as const };
    }

    const { connectDB } = await import("@/lib/db.server");
    const { Message } = await import("@/lib/models/message.model.server");

    await connectDB();
    const created = await Message.create({
      investorId: data.investorId,
      senderId: auth.admin._id,
      senderRole: "admin",
      body: data.body,
      readByInvestor: false,
      readByAdmin: true,
    });

    // Also raise a bell notification so the investor sees it in notifications.
    const { createNotification, notifySafe } = await import("@/lib/notifications.server");
    await notifySafe(
      () =>
        createNotification({
          userId: data.investorId,
          type: "system",
          title: "New message from GText Farms",
          body: data.body.length > 120 ? `${data.body.slice(0, 117)}…` : data.body,
          link: "/app/messages",
        }),
      "admin-message-notification",
    );

    return {
      success: true as const,
      message: {
        id: created._id.toString(),
        senderRole: "admin" as const,
        body: created.body,
        createdAt: created.createdAt.toISOString(),
      },
    };
  });

export const markAdminThreadReadFn = createServerFn({ method: "POST" })
  .validator(z.object({ investorId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Message } = await import("@/lib/models/message.model.server");

    await connectDB();
    await Message.updateMany(
      { investorId: data.investorId, senderRole: "investor", readByAdmin: false },
      { $set: { readByAdmin: true } },
    );
    return { success: true as const };
  });
