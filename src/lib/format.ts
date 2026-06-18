export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** e.g. ₦450M+, ₦1.2B+ for trust bar / marketing stats */
export function formatCompactNaira(amount: number) {
  if (amount >= 1_000_000_000) {
    return `₦${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B+`;
  }
  if (amount >= 1_000_000) {
    return `₦${Math.round(amount / 1_000_000)}M+`;
  }
  if (amount >= 1_000) {
    return `₦${Math.round(amount / 1_000)}K+`;
  }
  return formatNaira(amount);
}

export function formatCount(count: number) {
  if (count >= 1_000) {
    return `${Math.floor(count / 1_000)}K+`;
  }
  return String(count);
}

export function generateReference(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now()}-${rand}`;
}
