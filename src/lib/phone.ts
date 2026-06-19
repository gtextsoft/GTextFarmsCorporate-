/** Shared phone helpers (safe for client + server). */

export function normalizeNgPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return null;
}

export function isValidNgPhone(phone: string): boolean {
  return normalizeNgPhone(phone) !== null;
}

/** Display as 08012345678 for Nigerian users. */
export function formatNgPhoneDisplay(phone: string): string {
  const normalized = normalizeNgPhone(phone);
  if (!normalized) return phone;
  return `0${normalized.slice(3)}`;
}

/** Store consistently as 234XXXXXXXXXX in the database. */
export function storeNgPhone(phone: string): string | null {
  return normalizeNgPhone(phone);
}
