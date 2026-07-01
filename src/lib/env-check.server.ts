import { getServerConfig, isStrongSessionSecret } from "@/lib/config.server";

export type EnvCheckResult = {
  ok: boolean;
  checks: {
    name: string;
    ok: boolean;
    detail?: string;
  }[];
};

export function checkEnvironment(): EnvCheckResult {
  const config = getServerConfig();
  const checks: EnvCheckResult["checks"] = [
    {
      name: "MONGODB_URI",
      ok: Boolean(config.mongodbUri),
    },
    {
      name: "SESSION_SECRET",
      ok: isStrongSessionSecret(config.sessionSecret),
      detail: isStrongSessionSecret(config.sessionSecret)
        ? undefined
        : "Must be a unique random value of at least 32 characters (placeholder/default rejected)",
    },
    {
      name: "APP_URL",
      ok: Boolean(process.env.APP_URL || process.env.VERCEL_URL),
    },
    {
      name: "PAYSTACK_SECRET_KEY",
      ok: Boolean(config.paystackSecretKey),
      detail: "Required for live deposits",
    },
    {
      name: "PAYSTACK_WEBHOOK_SECRET",
      ok: Boolean(config.paystackWebhookSecret),
      detail: "Required for verified webhooks",
    },
    {
      name: "RESEND_API_KEY",
      ok: Boolean(config.resendApiKey),
      detail: "Transactional email (password reset, deposits, KYC). Contact form can use FORMSPREE_FORM_ID instead.",
    },
    {
      name: "FORMSPREE_FORM_ID",
      ok: Boolean(config.formspreeFormId),
      detail: "Optional — contact form email when Resend is not configured",
    },
    {
      name: "TERMII_API_KEY",
      ok: Boolean(config.termiiApiKey),
      detail: "Optional — SMS alerts",
    },
  ];

  const requiredOk = checks
    .filter((c) => ["MONGODB_URI", "SESSION_SECRET", "APP_URL"].includes(c.name))
    .every((c) => c.ok);

  return { ok: requiredOk, checks };
}
