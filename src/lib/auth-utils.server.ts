import { createHash } from "node:crypto";

import type { UserDocument } from "@/lib/models/user.model.server";
import type { SafeUser } from "@/lib/types";

export function toSafeUser(user: UserDocument): SafeUser {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone ?? undefined,
    role: user.role,
    kycStatus: user.kycStatus,
    address: user.address ?? undefined,
    city: user.city ?? undefined,
    state: user.state ?? undefined,
    bankName: user.bankName ?? undefined,
    accountNumber: user.accountNumber ? maskAccountNumber(user.accountNumber) : undefined,
    accountName: user.accountName ?? undefined,
  };
}

function maskAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function hashSensitive(value: string, pepper: string) {
  return createHash("sha256").update(`${pepper}:${value.trim()}`).digest("hex");
}
