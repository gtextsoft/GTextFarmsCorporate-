import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { withDatabase } from "@/lib/with-database";

export type ChatMessage = {
  id: string;
  senderRole: "investor" | "admin";
  body: string;
  createdAt: string;
};

async function requireUserId() {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };
  return { userId: session.data.userId };
}

export const getMyMessagesFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  return withDatabase(async () => {
    const { Message } = await import("@/lib/models/message.model.server");
    const docs = await Message.find({ investorId: auth.userId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return docs.map(
      (doc): ChatMessage => ({
        id: doc._id.toString(),
        senderRole: doc.senderRole as "investor" | "admin",
        body: doc.body,
        createdAt: doc.createdAt?.toISOString() ?? "",
      }),
    );
  }, []);
});

export const getUnreadMessageCountFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error, count: 0 };

  return withDatabase(
    async () => {
      const { Message } = await import("@/lib/models/message.model.server");
      const count = await Message.countDocuments({
        investorId: auth.userId,
        senderRole: "admin",
        readByInvestor: false,
      });
      return { count };
    },
    { count: 0 },
  );
});

export const sendMessageFn = createServerFn({ method: "POST" })
  .validator(z.object({ body: z.string().trim().min(1, "Message is empty").max(4000) }))
  .handler(async ({ data }) => {
    const auth = await requireUserId();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Message } = await import("@/lib/models/message.model.server");

    await connectDB();
    const created = await Message.create({
      investorId: auth.userId,
      senderId: auth.userId,
      senderRole: "investor",
      body: data.body,
      readByInvestor: true,
      readByAdmin: false,
    });

    return {
      success: true as const,
      message: {
        id: created._id.toString(),
        senderRole: "investor" as const,
        body: created.body,
        createdAt: created.createdAt.toISOString(),
      },
    };
  });

export const markMessagesReadFn = createServerFn({ method: "POST" }).handler(async () => {
  const auth = await requireUserId();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Message } = await import("@/lib/models/message.model.server");

  await connectDB();
  await Message.updateMany(
    { investorId: auth.userId, senderRole: "admin", readByInvestor: false },
    { $set: { readByInvestor: true } },
  );
  return { success: true as const };
});
