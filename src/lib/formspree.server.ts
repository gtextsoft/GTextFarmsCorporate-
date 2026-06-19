import { getServerConfig } from "@/lib/config.server";
import { inquiryIntentLabel } from "@/lib/inquiry-intents";

function appUrl() {
  return (
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  ).replace(/\/$/, "");
}

export type ContactInquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  intent?: string;
  productSlug?: string;
};

export async function sendContactInquiryViaFormspree(inquiry: ContactInquiryPayload) {
  const { formspreeFormId } = getServerConfig();
  if (!formspreeFormId) {
    console.warn(
      `[formspree] FORMSPREE_FORM_ID not set. Would notify for contact from ${inquiry.email}: ${inquiry.subject}`,
    );
    return { sent: false as const };
  }

  const intentLabel = inquiry.intent ? inquiryIntentLabel(inquiry.intent) : "General";

  const response = await fetch(`https://formspree.io/f/${formspreeFormId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: inquiry.name,
      email: inquiry.email,
      _replyto: inquiry.email,
      phone: inquiry.phone ?? "",
      subject: inquiry.subject,
      message: inquiry.message,
      intent: intentLabel,
      product: inquiry.productSlug ?? "",
      admin_link: `${appUrl()}/admin/inquiries`,
      _subject: `[Contact] ${inquiry.subject}`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Formspree submission failed: ${body}`);
  }

  return { sent: true as const };
}
