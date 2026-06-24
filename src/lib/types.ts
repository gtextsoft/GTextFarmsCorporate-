export type UserRole = "investor" | "admin" | "field_officer" | "super_admin";
export type KycStatus = "pending" | "submitted" | "verified" | "rejected";

export type MembershipStatus =
  | "registered"
  | "email_verified"
  | "provisional_member"
  | "full_member"
  | "payment_pending"
  | "funded"
  | "active_investor";

export type IdDocumentType = "nin" | "passport" | "voter_card" | "drivers_licence" | "other";

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  kycStatus: KycStatus;
  address?: string;
  city?: string;
  state?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  kycRejectionReason?: string;
  createdAt?: string;
  cooperativeMember?: boolean;
  membershipNumber?: string;
  membershipStatus?: MembershipStatus;
  emailVerified?: boolean;
  profileCompletedAt?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  idType?: IdDocumentType;
  idNumber?: string;
  occupation?: string;
  employer?: string;
  admissionDate?: string;
  bylawsAcceptedAt?: string;
  nextOfKin?: {
    fullName?: string;
    relationship?: string;
    address?: string;
    phone?: string;
  };
}

export interface CoopMemberRow extends SafeUser {
  createdAt: string;
}

export type ManualPaymentPurpose = "entrance_fee" | "investment_deposit";
export type ManualPaymentStatus = "pending" | "approved" | "rejected";

export interface CoopPaymentRow {
  id: string;
  purpose: ManualPaymentPurpose;
  amount: number;
  payerAccountName: string;
  payerBankName: string;
  transferReference?: string;
  transferDate?: string;
  receiptUrl: string;
  status: ManualPaymentStatus;
  reference: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  // Member identity (populated for the admin queue)
  memberName?: string;
  memberEmail?: string;
  membershipNumber?: string;
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
