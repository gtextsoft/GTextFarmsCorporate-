import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";

export const listAdminWithdrawalsFn = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        status: z.enum(["all", "pending", "completed", "rejected"]).optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const filter: { status?: string } = {};
    if (data?.status && data.status !== "all") {
      filter.status = data.status;
    }

    const rows = await Withdrawal.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const userIds = [...new Set(rows.map((r) => r.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return rows.map((row) => {
      const user = userMap.get(row.userId.toString());
      return {
        id: row._id.toString(),
        amount: row.amount,
        status: row.status,
        reference: row.reference,
        bankName: row.bankName,
        accountNumber: row.accountNumber,
        accountName: row.accountName,
        adminNote: row.adminNote ?? undefined,
        investorName: user?.fullName ?? "—",
        investorEmail: user?.email ?? "—",
        createdAt: row.createdAt?.toISOString() ?? "",
        processedAt: row.processedAt?.toISOString(),
      };
    });
  });

const reviewWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  adminNote: z.string().optional(),
});

export const reviewWithdrawalFn = createServerFn({ method: "POST" })
  .validator(reviewWithdrawalSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { completeWithdrawal } = await import("@/lib/wallet.server");

    await connectDB();

    try {
      await completeWithdrawal({
        withdrawalId: data.withdrawalId,
        adminUserId: auth.admin._id.toString(),
        action: data.action,
        adminNote: data.adminNote,
      });

      const { writeAuditLog } = await import("@/lib/audit.server");
      await writeAuditLog({
        actorId: auth.admin._id.toString(),
        actorEmail: auth.admin.email,
        action:
          data.action === "approve" ? "withdrawal.approve" : "withdrawal.reject",
        entityType: "withdrawal",
        entityId: data.withdrawalId,
        details: { adminNote: data.adminNote },
      });

      return { success: true as const };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Could not process withdrawal",
      };
    }
  });

export const getAdminWithdrawalStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");

  await connectDB();
  const pendingWithdrawals = await Withdrawal.countDocuments({ status: "pending" });
  return { pendingWithdrawals };
});
