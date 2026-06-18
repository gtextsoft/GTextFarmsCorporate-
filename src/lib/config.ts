/** Public config — safe for client and server. Values use VITE_ prefix. */
export function getPublicConfig() {
  return {
    appUrl: import.meta.env.VITE_APP_URL ?? "http://localhost:5173",
    paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };
}
