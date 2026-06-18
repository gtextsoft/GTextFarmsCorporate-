import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";
import type { KycStatus, SafeUser } from "@/lib/types";

export interface AdminInvestorRow extends SafeUser {
  createdAt: string;
  kycRejectionReason?: string;
}

const reviewKycSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export const listInvestorsFn = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        status: z.enum(["all", "pending", "submitted", "verified", "rejected"]).optional(),
      })
      .optional(),
  )
  .handler(async ({ data }): Promise<AdminInvestorRow[] | { error: string }> => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { toSafeUser } = await import("@/lib/auth-utils.server");
    const { User } = await import("@/lib/models/user.model.server");

    const filter: { role: string; kycStatus?: KycStatus } = { role: "investor" };
    if (data?.status && data.status !== "all") {
      filter.kycStatus = data.status;
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);
    return users.map((u) => ({
      ...toSafeUser(u),
      createdAt: u.createdAt?.toISOString() ?? new Date().toISOString(),
      kycRejectionReason: u.kycRejectionReason ?? undefined,
    }));
  });

export const reviewKycFn = createServerFn({ method: "POST" })
  .validator(reviewKycSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { User } = await import("@/lib/models/user.model.server");

    const user = await User.findById(data.userId);
    if (!user || user.role !== "investor") {
      return { error: "Investor not found." };
    }

    if (data.action === "approve") {
      user.kycStatus = "verified";
      user.kycRejectionReason = undefined;
    } else {
      user.kycStatus = "rejected";
      user.kycRejectionReason = data.reason?.trim() || "Verification could not be completed.";
    }

    await user.save();

    const { writeAuditLog } = await import("@/lib/audit.server");
    const { notifySafe, sendKycApprovedEmail } = await import("@/lib/email.server");

    await writeAuditLog({
      actorId: auth.admin._id.toString(),
      actorEmail: auth.admin.email,
      action: data.action === "approve" ? "kyc.approve" : "kyc.reject",
      entityType: "user",
      entityId: user._id.toString(),
      details: { kycStatus: user.kycStatus, reason: user.kycRejectionReason },
    });

    if (data.action === "approve") {
      await notifySafe(
        () => sendKycApprovedEmail(user.email, user.fullName),
        "kyc-approved",
      );
      const { createNotification, notifySafe: notify } = await import(
        "@/lib/notifications.server"
      );
      await notify(
        () =>
          createNotification({
            userId: user._id.toString(),
            type: "kyc",
            title: "KYC verified",
            body: "Your identity verification is approved. You can now fund your wallet and invest.",
            link: "/app/wallet",
          }),
        "kyc-notification",
      );
    }

    return { success: true as const, kycStatus: user.kycStatus };
  });

export const getAdminStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { User } = await import("@/lib/models/user.model.server");

  const [pendingKyc, submittedKyc, verifiedInvestors, totalInvestors] = await Promise.all([
    User.countDocuments({ role: "investor", kycStatus: "pending" }),
    User.countDocuments({ role: "investor", kycStatus: "submitted" }),
    User.countDocuments({ role: "investor", kycStatus: "verified" }),
    User.countDocuments({ role: "investor" }),
  ]);

  return { pendingKyc, submittedKyc, verifiedInvestors, totalInvestors };
});
