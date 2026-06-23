import { createHash } from "node:crypto";

import type { UserDocument } from "@/lib/models/user.model.server";
import type { SafeUser } from "@/lib/types";

export function toSafeUser(user: UserDocument): SafeUser {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    phone: user.phone ?? undefined,
    role: user.role,
    kycStatus: user.kycStatus,
    address: user.address ?? undefined,
    city: user.city ?? undefined,
    state: user.state ?? undefined,
    bankName: user.bankName ?? undefined,
    accountNumber: user.accountNumber ? maskAccountNumber(user.accountNumber) : undefined,
    accountName: user.accountName ?? undefined,
    cooperativeMember: user.cooperativeMember ?? undefined,
    membershipNumber: user.membershipNumber ?? undefined,
    membershipStatus: user.membershipStatus ?? undefined,
    emailVerified: user.emailVerified ?? undefined,
    profileCompletedAt: user.profileCompletedAt?.toISOString?.(),
    dateOfBirth: user.dateOfBirth?.toISOString?.().slice(0, 10),
    gender: user.gender ?? undefined,
    nationality: user.nationality ?? undefined,
    idType: user.idType ?? undefined,
    idNumber: user.idNumber ?? undefined,
    occupation: user.occupation ?? undefined,
    employer: user.employer ?? undefined,
    admissionDate: user.admissionDate?.toISOString?.().slice(0, 10),
    bylawsAcceptedAt: user.bylawsAcceptedAt?.toISOString?.(),
    nextOfKin: user.nextOfKin
      ? {
          fullName: user.nextOfKin.fullName ?? undefined,
          relationship: user.nextOfKin.relationship ?? undefined,
          address: user.nextOfKin.address ?? undefined,
          phone: user.nextOfKin.phone ?? undefined,
        }
      : undefined,
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

export function hashToken(token: string, pepper: string) {
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}
