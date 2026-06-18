import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { mapFieldReport } from "@/lib/field-report-mapper";
import { withDatabase } from "@/lib/with-database";

export const getPublishedReportsForCycleFn = createServerFn({ method: "GET" })
  .validator(z.object({ cycleSlug: z.string().min(1) }))
  .handler(async ({ data }) =>
    withDatabase(async () => {
      const { FieldReport } = await import("@/lib/models/field-report.model.server");
      const docs = await FieldReport.find({ cycleSlug: data.cycleSlug, status: "published" })
        .sort({ weekNumber: -1, publishedAt: -1 })
        .lean();
      return docs.map((doc) => mapFieldReport(doc as Record<string, unknown>));
    }, []),
  );

export const getInvestorActivityFeedFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) return { error: "Unauthorized" as const };

  return withDatabase(async () => {
    const { Investment } = await import("@/lib/models/investment.model.server");
    const { FieldReport } = await import("@/lib/models/field-report.model.server");

    const investments = await Investment.find({
      userId: session.data.userId,
      status: { $in: ["confirmed", "active", "completed"] },
    }).lean();

    const cycleSlugs = [...new Set(investments.map((inv) => inv.cycleSlug))];
    if (cycleSlugs.length === 0) return [];

    const docs = await FieldReport.find({
      cycleSlug: { $in: cycleSlugs },
      status: "published",
    })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();

    return docs.map((doc) => mapFieldReport(doc as Record<string, unknown>));
  }, []);
});
