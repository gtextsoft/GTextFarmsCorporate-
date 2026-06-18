import { createHmac, timingSafeEqual } from "node:crypto";

import { getPublicConfig } from "@/lib/config";
import { getServerConfig } from "@/lib/config.server";

const PAYSTACK_BASE = "https://api.paystack.co";

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}) {
  const { paystackSecretKey } = getServerConfig();
  if (!paystackSecretKey) {
    throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY in your environment.");
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: "NGN",
      metadata: params.metadata,
    }),
  });

  const json = (await res.json()) as PaystackInitResponse;
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialization failed");
  }

  return json.data;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const { paystackSecretKey } = getServerConfig();
  if (!paystackSecretKey || !signature) return false;

  const hash = createHmac("sha512", paystackSecretKey).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function getPaystackCallbackUrl() {
  const { appUrl } = getPublicConfig();
  return `${appUrl}/app/wallet`;
}
