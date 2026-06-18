import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";
import { mapFieldReport } from "@/lib/field-report-mapper";

export const listAdminFieldReportsFn = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        status: z.enum(["all", "submitted", "published", "rejected", "draft"]).optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const filter: { status?: string } = {};
    if (data?.status && data.status !== "all") {
      filter.status = data.status;
    } else if (!data?.status) {
      filter.status = "submitted";
    }

    const docs = await FieldReport.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map((doc) => mapFieldReport(doc as Record<string, unknown>));
  });

const reviewReportSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(["publish", "reject"]),
  rejectionReason: z.string().optional(),
});

export const reviewFieldReportFn = createServerFn({ method: "POST" })
  .validator(reviewReportSchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    await connectDB();
    const report = await FieldReport.findById(data.reportId);
    if (!report) return { error: "Report not found." as const };
    if (report.status !== "submitted") {
      return { error: "Only submitted reports can be reviewed." as const };
    }

    if (data.action === "publish") {
      report.status = "published";
      report.publishedAt = new Date();
      report.rejectionReason = undefined;
    } else {
      report.status = "rejected";
      report.rejectionReason =
        data.rejectionReason?.trim() || "Report needs corrections before publishing.";
    }

    report.reviewedBy = auth.admin._id;
    await report.save();

    const { writeAuditLog } = await import("@/lib/audit.server");
    const { notifySafe, sendFieldReportPublishedEmail } = await import("@/lib/email.server");

    await writeAuditLog({
      actorId: auth.admin._id.toString(),
      actorEmail: auth.admin.email,
      action: data.action === "publish" ? "field_report.publish" : "field_report.reject",
      entityType: "field_report",
      entityId: report._id.toString(),
      details: {
        cycleSlug: report.cycleSlug,
        title: report.title,
        rejectionReason: report.rejectionReason,
      },
    });

    if (data.action === "publish") {
      const { Investment } = await import("@/lib/models/investment.model.server");
      const { User } = await import("@/lib/models/user.model.server");

      const investments = await Investment.find({
        cycleId: report.cycleId,
        status: "confirmed",
      }).lean();
      const userIds = [...new Set(investments.map((inv) => inv.userId.toString()))];
      const users = await User.find({ _id: { $in: userIds } }).lean();

      for (const user of users) {
        await notifySafe(
          () =>
            sendFieldReportPublishedEmail(
              user.email,
              user.fullName,
              report.cycleTitle,
              report.title,
            ),
          `field-report-published:${user.email}`,
        );
        const { createNotification, notifySafe: notify } = await import(
          "@/lib/notifications.server"
        );
        await notify(
          () =>
            createNotification({
              userId: user._id.toString(),
              type: "field_report",
              title: `New update: ${report.cycleTitle}`,
              body: report.title,
              link: "/app/activity",
            }),
          `field-report-notification:${user.email}`,
        );
      }
    }

    return { success: true as const, status: report.status };
  });

export const getAdminFieldReportStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { FieldReport } = await import("@/lib/models/field-report.model.server");

  await connectDB();
  const pendingReports = await FieldReport.countDocuments({ status: "submitted" });
  return { pendingReports };
});
