import { connectDB } from "@/lib/db.server";
import { AuditLog } from "@/lib/models/audit-log.model.server";

export async function writeAuditLog(params: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  await connectDB();
  await AuditLog.create({
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    details: params.details,
  });
}
