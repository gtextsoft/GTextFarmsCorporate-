import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdminSession } from "@/lib/api/admin-session";

export const listAdminInquiriesFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await requireAdminSession();
  if ("error" in auth) return { error: auth.error };

  const { connectDB } = await import("@/lib/db.server");
  const { ContactInquiry } = await import("@/lib/models/contact-inquiry.model.server");

  await connectDB();
  const docs = await ContactInquiry.find().sort({ createdAt: -1 }).limit(200).lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    subject: doc.subject,
    message: doc.message,
    intent: doc.intent ?? "general",
    productSlug: doc.productSlug,
    status: doc.status ?? "new",
    adminNote: doc.adminNote,
    createdAt: doc.createdAt?.toISOString() ?? "",
  }));
});

export const getAdminInquiryFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { ContactInquiry } = await import("@/lib/models/contact-inquiry.model.server");

    await connectDB();
    const doc = await ContactInquiry.findById(data.id).lean();
    if (!doc) return { error: "Inquiry not found." as const };

    if (doc.status === "new") {
      await ContactInquiry.updateOne({ _id: doc._id }, { $set: { status: "read" } });
    }

    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      subject: doc.subject,
      message: doc.message,
      intent: doc.intent ?? "general",
      productSlug: doc.productSlug,
      status: doc.status === "new" ? "read" : (doc.status ?? "new"),
      adminNote: doc.adminNote,
      createdAt: doc.createdAt?.toISOString() ?? "",
    };
  });

const updateInquirySchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "read", "replied", "archived"]).optional(),
  adminNote: z.string().max(2000).optional(),
});

export const updateAdminInquiryFn = createServerFn({ method: "POST" })
  .validator(updateInquirySchema)
  .handler(async ({ data }) => {
    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };

    const { connectDB } = await import("@/lib/db.server");
    const { ContactInquiry } = await import("@/lib/models/contact-inquiry.model.server");

    await connectDB();
    const update: Record<string, unknown> = {};
    if (data.status) update.status = data.status;
    if (data.adminNote !== undefined) update.adminNote = data.adminNote;

    const doc = await ContactInquiry.findByIdAndUpdate(data.id, { $set: update }, { new: true }).lean();
    if (!doc) return { error: "Inquiry not found." as const };

    return { success: true as const };
  });
