export type UserRole = "investor" | "admin" | "field_officer" | "super_admin";
export type KycStatus = "pending" | "submitted" | "verified" | "rejected";

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  kycStatus: KycStatus;
  address?: string;
  city?: string;
  state?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
}

export interface AdminInvestorRow extends SafeUser {
  createdAt: string;
  kycRejectionReason?: string;
}
