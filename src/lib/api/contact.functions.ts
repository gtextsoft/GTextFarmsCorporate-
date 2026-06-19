import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional(),
  subject: z.string().min(1).max(300),
  message: z.string().min(1).max(5000),
  intent: z
    .enum(["general", "quote", "bulk", "investment", "partnership", "careers", "press"])
    .optional(),
  productSlug: z.string().max(100).optional(),
});

export const submitContactFn = createServerFn({ method: "POST" })
  .validator(submitContactSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { ContactInquiry } = await import("@/lib/models/contact-inquiry.model.server");
    const { getServerConfig } = await import("@/lib/config.server");
    const { notifySafe, sendContactInquiryEmail } = await import("@/lib/email.server");
    const { sendContactInquiryViaFormspree } = await import("@/lib/formspree.server");

    await connectDB();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await ContactInquiry.countDocuments({
      email: data.email.trim().toLowerCase(),
      createdAt: { $gte: oneHourAgo },
    });
    if (recentCount >= 5) {
      return { error: "Too many messages sent recently. Please try again later or email us directly." as const };
    }

    const inquiry = await ContactInquiry.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || undefined,
      subject: data.subject.trim(),
      message: data.message.trim(),
      intent: data.intent ?? "general",
      productSlug: data.productSlug,
      status: "new",
    });

    const inquiryPayload = {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      subject: inquiry.subject,
      message: inquiry.message,
      intent: inquiry.intent,
      productSlug: inquiry.productSlug,
    };

    const { resendApiKey, formspreeFormId } = getServerConfig();

    if (resendApiKey) {
      await notifySafe(
        () => sendContactInquiryEmail(inquiryPayload),
        "contact inquiry notification (Resend)",
      );
    } else if (formspreeFormId) {
      await notifySafe(
        () => sendContactInquiryViaFormspree(inquiryPayload),
        "contact inquiry notification (Formspree)",
      );
    }

    return { success: true as const, id: inquiry._id.toString() };
  });
