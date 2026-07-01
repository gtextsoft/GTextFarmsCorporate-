import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    mongodbUri: process.env.MONGODB_URI,
    sessionSecret: process.env.SESSION_SECRET,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    formspreeFormId: process.env.FORMSPREE_FORM_ID,
    coopMembershipStart: process.env.COOP_MEMBERSHIP_START,
    termiiApiKey: process.env.TERMII_API_KEY,
    termiiSenderId: process.env.TERMII_SENDER_ID,
  };
}

// Known placeholder/default secrets that must never be used to sign cookies
// or pepper hashes in production — a known secret means forgeable sessions.
const PLACEHOLDER_SESSION_SECRETS = [
  "dev-only-change-me-32-chars-min!!",
  "dev-only-change-me-use-32-chars-minimum!!",
];

const DEV_FALLBACK_SECRET = "dev-only-change-me-32-chars-min!!";

/** A secret is strong if it is set, long enough, and not a known placeholder. */
export function isStrongSessionSecret(secret: string | undefined): secret is string {
  return Boolean(secret && secret.length >= 32 && !PLACEHOLDER_SESSION_SECRETS.includes(secret));
}

/**
 * The validated cookie-signing / session secret. In production a missing,
 * too-short, or placeholder value throws (fail closed) rather than silently
 * using a publicly-known key. Outside production it falls back to a dev value
 * so local development works without configuration.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (isStrongSessionSecret(secret)) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be a unique, random value of at least 32 characters in " +
        "production; the placeholder/default value is rejected.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

/**
 * Pepper for hashing sensitive fields (BVN/NIN) and short-lived tokens. Uses a
 * dedicated DATA_PEPPER when set so it is a distinct key from the cookie secret;
 * otherwise falls back to the validated session secret.
 */
export function getDataPepper(): string {
  return process.env.DATA_PEPPER ?? getSessionSecret();
}

/** Co-operative entrance fee, in Naira. Gates full membership. */
export function getCoopEntranceFee(): number {
  const raw = process.env.COOP_ENTRANCE_FEE;
  const parsed = raw ? Number.parseInt(raw, 10) : 10_000;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10_000;
}

/**
 * When true, the co-operative verify-email page shows a copyable code/link
 * (email delivery is not relied on). Fail-closed: only exposed when explicitly
 * opted in via COOP_EXPOSE_VERIFICATION_LINK="true" (intended for dev/staging).
 */
export function shouldExposeCoopVerificationLink(): boolean {
  return process.env.COOP_EXPOSE_VERIFICATION_LINK === "true";
}

/** GText Farms bank details shown to members for manual bank-transfer payments. */
export function getCoopBankDetails() {
  return {
    accountName: process.env.COOP_BANK_ACCOUNT_NAME ?? "GText Farms Co-operative Society",
    bankName: process.env.COOP_BANK_NAME ?? "—",
    accountNumber: process.env.COOP_BANK_ACCOUNT_NUMBER ?? "—",
  };
}
