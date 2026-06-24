import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import { getCoopRequiredPath } from "@/lib/coop-membership";
import { isValidNgPhone, storeNgPhone } from "@/lib/phone";
import type { CoopMemberRow, MembershipStatus } from "@/lib/types";

function appUrl() {
  return (
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  ).replace(/\/$/, "");
}

async function createVerificationToken(userId: string) {
  const { getServerConfig } = await import("@/lib/config.server");
  const { hashToken } = await import("@/lib/auth-utils.server");
  const { User } = await import("@/lib/models/user.model.server");

  const token = randomBytes(32).toString("hex");
  const { sessionSecret } = getServerConfig();
  const pepper = sessionSecret ?? "dev-only-change-me-32-chars-min!!";

  await User.findByIdAndUpdate(userId, {
    emailVerificationTokenHash: hashToken(token, pepper),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return `${appUrl()}/co-operative/verify?token=${token}`;
}

async function sendVerificationEmail(user: { _id: { toString(): string }; email: string; fullName: string }) {
  const verifyUrl = await createVerificationToken(user._id.toString());
  const { sendCoopWelcomeVerifyEmail } = await import("@/lib/email.server");

  console.info(`[coop] Verification link for ${user.email}: ${verifyUrl}`);
  await sendCoopWelcomeVerifyEmail(user.email, user.fullName, verifyUrl);
}

const coopRegisterSchema = z
  .object({
    firstName: z.string().min(2, "Enter your first name"),
    lastName: z.string().min(2, "Enter your last name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const coopSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const completeProfileSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  nationality: z.string().min(2),
  phone: z
    .string()
    .min(10)
    .refine(isValidNgPhone, "Use format 08012345678 or +2348012345678"),
  idType: z.enum(["nin", "passport", "voter_card", "drivers_licence", "other"]),
  idNumber: z.string().min(3),
  idDocumentUrl: z.string().url().optional().or(z.literal("")),
  passportPhotoUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  nextOfKinName: z.string().min(2),
  nextOfKinRelationship: z.string().min(2),
  nextOfKinAddress: z.string().min(5),
  nextOfKinPhone: z
    .string()
    .min(10)
    .refine(isValidNgPhone, "Enter a valid next of kin phone number"),
  bankName: z.string().min(2),
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
  accountName: z.string().min(2),
  acceptBylaws: z.boolean().refine((v) => v === true, {
    message: "You must accept the cooperative bylaws",
  }),
});

export const coopRegisterFn = createServerFn({ method: "POST" })
  .validator(coopRegisterSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { useAppSession } = await import("@/lib/session.server");
    const { getOrCreateWallet } = await import("@/lib/wallet.server");

    await connectDB();

    const email = data.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      return { error: "An account with this email already exists. Try signing in." as const };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const user = await User.create({
      email,
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      fullName,
      role: "investor",
      kycStatus: "pending",
      cooperativeMember: true,
      membershipStatus: "registered",
      emailVerified: false,
    });

    await getOrCreateWallet(user._id.toString());
    await sendVerificationEmail(user);

    const session = await useAppSession();
    await session.update({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    });

    throw redirect({ to: "/co-operative/verify-email" });
  });

export const coopSignInFn = createServerFn({ method: "POST" })
  .validator(coopSignInSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { useAppSession } = await import("@/lib/session.server");
    const { toSafeUser } = await import("@/lib/auth-utils.server");

    await connectDB();

    const user = await User.findOne({ email: data.email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return { error: "Invalid email or password." as const };
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return { error: "Invalid email or password." as const };
    }

    if (!user.cooperativeMember) {
      return {
        error: "This account is not registered with the co-operative. Use the main investor sign-in or register here." as const,
      };
    }

    const session = await useAppSession();
    await session.update({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    });

    const safe = toSafeUser(user);
    const required = getCoopRequiredPath(safe);
    throw redirect({ to: required ?? "/co-operative/dashboard" });
  });

export const resendCoopVerificationFn = createServerFn({ method: "POST" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) {
    return { error: "You must be signed in." as const };
  }

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");

  await connectDB();
  const user = await User.findById(session.data.userId);
  if (!user?.cooperativeMember) {
    return { error: "Not a co-operative member." as const };
  }

  if (user.emailVerified) {
    return { error: "Your email is already verified." as const };
  }

  await sendVerificationEmail(user);
  return { success: true as const };
});

export const verifyCoopEmailFn = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { getServerConfig } = await import("@/lib/config.server");
    const { hashToken } = await import("@/lib/auth-utils.server");
    const { assignNextMembershipNumber } = await import("@/lib/coop-membership.server");
    const { User } = await import("@/lib/models/user.model.server");
    const {
      notifySafe,
      sendCoopMembershipEmail,
    } = await import("@/lib/email.server");

    await connectDB();

    const { sessionSecret } = getServerConfig();
    const pepper = sessionSecret ?? "dev-only-change-me-32-chars-min!!";
    const tokenHash = hashToken(data.token, pepper);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
      cooperativeMember: true,
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!user) {
      return { error: "This verification link is invalid or has expired." as const };
    }

    if (!user.emailVerified) {
      const membershipNumber = await assignNextMembershipNumber();
      user.membershipNumber = membershipNumber;
      user.emailVerified = true;
      user.membershipStatus = "provisional_member";
      user.emailVerificationTokenHash = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      const profileUrl = `${appUrl()}/co-operative/complete-profile`;
      await notifySafe(
        () => sendCoopMembershipEmail(user.email, user.fullName, membershipNumber, profileUrl),
        "co-op membership email",
      );
    }

    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    await session.update({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    });

    throw redirect({ to: "/co-operative/complete-profile" });
  });

export const completeCoopProfileFn = createServerFn({ method: "POST" })
  .validator(completeProfileSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) {
      return { error: "You must be signed in." as const };
    }

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { notifySafe, sendCoopProfileCompleteEmail } = await import("@/lib/email.server");

    await connectDB();
    const user = await User.findById(session.data.userId);
    if (!user?.cooperativeMember) {
      return { error: "Not a co-operative member." as const };
    }

    if (user.membershipStatus !== "provisional_member") {
      return { error: "Your profile has already been completed." as const };
    }

    user.phone = storeNgPhone(data.phone) ?? data.phone;
    user.dateOfBirth = new Date(data.dateOfBirth);
    user.gender = data.gender;
    user.nationality = data.nationality.trim();
    user.idType = data.idType;
    user.idNumber = data.idNumber.trim();
    user.idDocumentUrls = data.idDocumentUrl ? [data.idDocumentUrl] : [];
    user.passportPhotoUrls = data.passportPhotoUrl ? [data.passportPhotoUrl] : [];
    user.address = data.address.trim();
    user.city = data.city.trim();
    user.state = data.state.trim();
    user.occupation = data.occupation?.trim() || undefined;
    user.employer = data.employer?.trim() || undefined;
    user.nextOfKin = {
      fullName: data.nextOfKinName.trim(),
      relationship: data.nextOfKinRelationship.trim(),
      address: data.nextOfKinAddress.trim(),
      phone: storeNgPhone(data.nextOfKinPhone) ?? data.nextOfKinPhone,
    };
    user.bankName = data.bankName.trim();
    user.accountNumber = data.accountNumber.trim();
    user.accountName = data.accountName.trim();
    user.bylawsAcceptedAt = new Date();
    user.profileCompletedAt = new Date();
    // Full membership is gated on the entrance fee being paid + admin-confirmed.
    user.membershipStatus = "payment_pending";
    await user.save();

    const fundUrl = `${appUrl()}/co-operative/fund`;
    await notifySafe(
      () => sendCoopProfileCompleteEmail(user.email, user.fullName, fundUrl),
      "co-op profile complete email",
    );

    throw redirect({ to: "/co-operative/fund" });
  });

export const listCoopMembersFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      status: z
        .enum([
          "all",
          "registered",
          "email_verified",
          "provisional_member",
          "full_member",
          "payment_pending",
          "funded",
          "active_investor",
        ])
        .optional(),
    }),
  )
  .handler(async ({ data }): Promise<CoopMemberRow[] | { error: string }> => {
    const { requireAdminSession } = await import("@/lib/api/admin-session");
    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { toSafeUser } = await import("@/lib/auth-utils.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error };
    await connectDB();

    const filter: Record<string, unknown> = { cooperativeMember: true };
    if (data.status && data.status !== "all") {
      filter.membershipStatus = data.status;
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    return users.map(
      (user): CoopMemberRow => ({
        ...toSafeUser(user),
        createdAt: user.createdAt.toISOString(),
      }),
    );
  });

export const getCoopDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) {
    return { error: "Unauthorized" as const };
  }

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { Wallet } = await import("@/lib/models/wallet.model.server");
  const { Investment } = await import("@/lib/models/investment.model.server");
  const { ManualPayment } = await import("@/lib/models/manual-payment.model.server");
  const { getCoopEntranceFee } = await import("@/lib/config.server");

  await connectDB();
  const user = await User.findById(session.data.userId);
  if (!user?.cooperativeMember) {
    return { error: "Not a co-operative member." as const };
  }

  const wallet = await Wallet.findOne({ userId: user._id });
  const investments = await Investment.find({ userId: user._id });
  const pendingPayments = await ManualPayment.find({ userId: user._id, status: "pending" });

  const status = user.membershipStatus as MembershipStatus;
  const entranceFeePaid =
    status === "full_member" || status === "funded" || status === "active_investor";

  return {
    membershipNumber: user.membershipNumber,
    membershipStatus: status,
    entranceFee: getCoopEntranceFee(),
    entranceFeePaid,
    balance: wallet?.balance ?? 0,
    withdrawable: 0,
    pendingPayment: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0),
    activeInvestments: investments.length,
  };
});
