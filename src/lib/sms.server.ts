import { getServerConfig } from "@/lib/config.server";
import { brand } from "@/lib/brand";
import { formatNaira } from "@/lib/format";
import { normalizeNgPhone } from "@/lib/phone";

export async function sendSms(params: { to: string; message: string }) {
  const { termiiApiKey, termiiSenderId } = getServerConfig();
  const to = normalizeNgPhone(params.to);

  if (!to) {
    console.warn(`[sms] Invalid phone number: ${params.to}`);
    return { sent: false as const, reason: "invalid_phone" as const };
  }

  if (!termiiApiKey) {
    console.warn(`[sms] TERMII_API_KEY not set. Would send to ${to}: ${params.message}`);
    return { sent: false as const, reason: "not_configured" as const };
  }

  const response = await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: termiiApiKey,
      to,
      from: termiiSenderId ?? brand.name.slice(0, 11),
      sms: params.message,
      type: "plain",
      channel: "generic",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SMS send failed: ${body}`);
  }

  return { sent: true as const };
}

export async function sendSmsToUser(userId: string, message: string) {
  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");

  await connectDB();
  const user = await User.findById(userId).select("phone").lean();
  if (!user?.phone) return { sent: false as const, reason: "no_phone" as const };

  return sendSms({ to: user.phone, message });
}

export async function sendDepositSms(userId: string, amount: number) {
  return sendSmsToUser(
    userId,
    `${brand.name}: Wallet deposit of ${formatNaira(amount)} received. View your wallet in the app.`,
  );
}

export async function sendWithdrawalApprovedSms(userId: string, amount: number) {
  return sendSmsToUser(
    userId,
    `${brand.name}: Your ${formatNaira(amount)} withdrawal has been processed.`,
  );
}

export async function sendWithdrawalRejectedSms(userId: string, amount: number) {
  return sendSmsToUser(
    userId,
    `${brand.name}: Your ${formatNaira(amount)} withdrawal request was not approved. Check the app for details.`,
  );
}

export async function sendKycApprovedSms(userId: string) {
  return sendSmsToUser(
    userId,
    `${brand.name}: KYC verified. You can now fund your wallet and invest in open cycles.`,
  );
}

export async function notifySmsSafe(fn: () => Promise<unknown>, label: string) {
  try {
    await fn();
  } catch (err) {
    console.error(`[sms] ${label} failed:`, err);
  }
}
