import { getServerConfig } from "@/lib/config.server";
import { formatNaira } from "@/lib/format";
import { brand } from "@/lib/brand";

function appUrl() {
  return (
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  ).replace(/\/$/, "");
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const { resendApiKey } = getServerConfig();
  if (!resendApiKey) {
    console.warn(`[email] RESEND_API_KEY not set. Would send to ${params.to}: ${params.subject}`);
    return { sent: false as const };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? `${brand.name} <onboarding@resend.dev>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email send failed: ${body}`);
  }

  return { sent: true as const };
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: `Reset your ${brand.name} password`,
    html: `
      <p>You requested a password reset for your ${brand.name} account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  });
}

export async function sendKycApprovedEmail(email: string, fullName: string) {
  return sendEmail({
    to: email,
    subject: `KYC verified — you can now invest on ${brand.name}`,
    html: `
      <p>Hi ${fullName},</p>
      <p>Your identity verification has been approved. You can now fund your wallet and invest in open cycles.</p>
      <p><a href="${appUrl()}/app/wallet">Fund wallet</a> · <a href="${appUrl()}/opportunities">Browse opportunities</a></p>
    `,
  });
}

export async function sendInvestmentConfirmedEmail(
  email: string,
  fullName: string,
  cycleTitle: string,
  amount: number,
  certificateNumber: string,
) {
  return sendEmail({
    to: email,
    subject: `Investment confirmed — ${cycleTitle}`,
    html: `
      <p>Hi ${fullName},</p>
      <p>Your investment of <strong>${formatNaira(amount)}</strong> in <strong>${cycleTitle}</strong> is confirmed.</p>
      <p>Certificate: <code>${certificateNumber}</code></p>
      <p><a href="${appUrl()}/app/investments">View your portfolio</a></p>
    `,
  });
}

export async function sendDepositReceiptEmail(email: string, fullName: string, amount: number) {
  return sendEmail({
    to: email,
    subject: `Wallet deposit received — ${formatNaira(amount)}`,
    html: `
      <p>Hi ${fullName},</p>
      <p>We received your wallet deposit of <strong>${formatNaira(amount)}</strong>. Your balance has been updated.</p>
      <p><a href="${appUrl()}/app/wallet">View wallet</a></p>
    `,
  });
}

export async function sendFieldReportPublishedEmail(
  email: string,
  fullName: string,
  cycleTitle: string,
  reportTitle: string,
) {
  return sendEmail({
    to: email,
    subject: `New farm update — ${cycleTitle}`,
    html: `
      <p>Hi ${fullName},</p>
      <p>A new field report was published for a cycle you invested in: <strong>${reportTitle}</strong>.</p>
      <p><a href="${appUrl()}/app/activity">Read farm updates</a></p>
    `,
  });
}

export async function sendContactInquiryEmail(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  intent?: string;
  productSlug?: string;
}) {
  const salesEmail = brand.contact.salesEmail;
  const lines = [
    `<p><strong>New contact inquiry</strong> from ${inquiry.name} (${inquiry.email})</p>`,
    inquiry.phone ? `<p>Phone: ${inquiry.phone}</p>` : "",
    `<p>Subject: ${inquiry.subject}</p>`,
    inquiry.intent ? `<p>Intent: ${inquiry.intent}</p>` : "",
    inquiry.productSlug ? `<p>Product: ${inquiry.productSlug}</p>` : "",
    `<p>${inquiry.message.replace(/\n/g, "<br>")}</p>`,
    `<p><a href="${appUrl()}/admin/inquiries">View in admin</a></p>`,
  ].join("");

  return sendEmail({
    to: salesEmail,
    subject: `[Contact] ${inquiry.subject}`,
    html: lines,
  });
}

export async function notifySafe(
  fn: () => Promise<unknown>,
  label: string,
) {
  try {
    await fn();
  } catch (err) {
    console.error(`[email] ${label} failed:`, err);
  }
}
