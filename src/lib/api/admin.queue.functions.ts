import { createServerFn } from "@tanstack/react-start";

import { requireAdminSession } from "@/lib/api/admin-session";

export type AdminQueueCounts = {
  newInquiries: number;
  submittedKyc: number;
  pendingWithdrawals: number;
  pendingReports: number;
};

export const getAdminQueueCountsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { ContactInquiry } = await import("@/lib/models/contact-inquiry.model.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { Withdrawal } = await import("@/lib/models/withdrawal.model.server");
  const { FieldReport } = await import("@/lib/models/field-report.model.server");

  await connectDB();

  const [newInquiries, submittedKyc, pendingWithdrawals, pendingReports] = await Promise.all([
    ContactInquiry.countDocuments({ status: "new" }),
    User.countDocuments({ role: "investor", kycStatus: "submitted" }),
    Withdrawal.countDocuments({ status: "pending" }),
    FieldReport.countDocuments({ status: "submitted" }),
  ]);

  return { newInquiries, submittedKyc, pendingWithdrawals, pendingReports };
});
