import type { MembershipStatus, SafeUser } from "@/lib/types";

/** Routes a co-operative member may always reach for their current onboarding step. */
export const COOP_PUBLIC_PATHS = [
  "/co-operative",
  "/co-operative/register",
  "/co-operative/login",
  "/co-operative/verify-email",
  "/co-operative/verify",
] as const;

export function formatMembershipNumber(n: number): string {
  return String(n).padStart(6, "0");
}

export function getCoopMembershipStart(): number {
  const raw = process.env.COOP_MEMBERSHIP_START;
  const parsed = raw ? Number.parseInt(raw, 10) : 32;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 32;
}

/** Where an authenticated co-operative member should land next. */
export function getCoopRequiredPath(user: Pick<SafeUser, "cooperativeMember" | "membershipStatus" | "emailVerified">): string | null {
  if (!user.cooperativeMember) return null;

  switch (user.membershipStatus) {
    case "registered":
      return "/co-operative/verify-email";
    case "email_verified":
      return "/co-operative/verify-email";
    case "provisional_member":
      return "/co-operative/complete-profile";
    case "full_member":
    case "payment_pending":
    case "funded":
    case "active_investor":
      return null;
    default:
      return "/co-operative/verify-email";
  }
}

export function isCoopOnboardingComplete(status: MembershipStatus | undefined): boolean {
  return status === "full_member" || status === "payment_pending" || status === "funded" || status === "active_investor";
}

/** Where co-operative members land after sign-in when no onboarding step is required. */
export function getCoopMemberHomePath(
  user: Pick<SafeUser, "membershipStatus">,
): string {
  switch (user.membershipStatus) {
    case "provisional_member":
      return "/co-operative/complete-profile";
    case "payment_pending":
      return "/co-operative/fund";
    default:
      return "/app";
  }
}

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  registered: "Registered",
  email_verified: "Email verified",
  provisional_member: "Profile incomplete",
  full_member: "Full member",
  payment_pending: "Payment pending",
  funded: "Funded",
  active_investor: "Active investor",
};
