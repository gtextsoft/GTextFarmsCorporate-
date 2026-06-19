import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";

export const listAdminAuditLogsFn = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        action: z.string().optional(),
        entityType: z.string().optional(),
        limit: z.number().min(1).max(200).optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { AuditLog } = await import("@/lib/models/audit-log.model.server");

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (data?.action) filter.action = data.action;
    if (data?.entityType) filter.entityType = data.entityType;

    const limit = data?.limit ?? 100;

    const docs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    return docs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? undefined,
      actorEmail: log.actorEmail ?? undefined,
      details: log.details as Record<string, unknown> | undefined,
      createdAt: log.createdAt?.toISOString() ?? "",
    }));
  });
