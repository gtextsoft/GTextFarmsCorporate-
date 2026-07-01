import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import { getCoopMemberHomePath, getCoopRequiredPath } from "@/lib/coop-membership";
import { isValidNgPhone, storeNgPhone } from "@/lib/phone";
import type { CoopMemberRow } from "@/lib/types";

function appUrl() {
  return (
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  ).replace(/\/$/, "");
}

function createVerificationCode(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

async function createVerificationCredentials(userId: string) {
  const { getDataPepper } = await import("@/lib/config.server");
  const { hashToken } = await import("@/lib/auth-utils.server");
  const { User } = await import("@/lib/models/user.model.server");

  const token = randomBytes(32).toString("hex");
  const code = createVerificationCode();
  const pepper = getDataPepper();

  await User.findByIdAndUpdate(userId, {
    emailVerificationTokenHash: hashToken(token, pepper),
    emailVerificationCode: code,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return {
    verifyUrl: `${appUrl()}/co-operative/verify?token=${token}`,
    code,
  };
}

async function sendVerificationEmail(user: { _id: { toString(): string }; email: string; fullName: string }) {
  const { verifyUrl, code } = await createVerificationCredentials(user._id.toString());
  const { sendCoopWelcomeVerifyEmail } = await import("@/lib/email.server");

  console.info(`[coop] Verification for ${user.email} — link: ${verifyUrl} — code: ${code}`);
  await sendCoopWelcomeVerifyEmail(user.email, user.fullName, verifyUrl);
}

async function finalizeCoopEmailVerification(userId: string) {
  const { connectDB } = await import("@/lib/db.server");
  const { assignNextMembershipNumber } = await import("@/lib/coop-membership.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { notifySafe, sendCoopMembershipEmail } = await import("@/lib/email.server");
  const { useAppSession } = await import("@/lib/session.server");

  await connectDB();
  const user = await User.findById(userId);
  if (!user?.cooperativeMember) {
    return { error: "Not a co-operative member." as const };
  }

  if (!user.emailVerified) {
    const membershipNumber = await assignNextMembershipNumber();
    user.membershipNumber = membershipNumber;
    user.emailVerified = true;
    user.membershipStatus = "provisional_member";
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const profileUrl = `${appUrl()}/co-operative/complete-profile`;
    await notifySafe(
      () => sendCoopMembershipEmail(user.email, user.fullName, membershipNumber, profileUrl),
      "co-op membership email",
    );
  }

  const session = await useAppSession();
  await session.update({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    kycStatus: user.kycStatus,
  });

  throw redirect({ to: "/co-operative/complete-profile" });
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
    throw redirect({ to: required ?? getCoopMemberHomePath(safe) });
  });

export const resendCoopVerificationFn = createServerFn({ method: "POST" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) {
    return { error: "You must be signed in." as const };
  }

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { shouldExposeCoopVerificationLink } = await import("@/lib/config.server");

  await connectDB();
  const user = await User.findById(session.data.userId);
  if (!user?.cooperativeMember) {
    return { error: "Not a co-operative member." as const };
  }

  if (user.emailVerified) {
    return { error: "Your email is already verified." as const };
  }

  const credentials = await createVerificationCredentials(user._id.toString());
  const { sendCoopWelcomeVerifyEmail } = await import("@/lib/email.server");
  console.info(
    `[coop] Verification for ${user.email} — link: ${credentials.verifyUrl} — code: ${credentials.code}`,
  );
  await sendCoopWelcomeVerifyEmail(user.email, user.fullName, credentials.verifyUrl);

  if (shouldExposeCoopVerificationLink()) {
    return { success: true as const, code: credentials.code };
  }
  return { success: true as const };
});

/** Dev/staging: return a copyable verification code when email delivery is unavailable. */
export const getCoopVerificationDevFn = createServerFn({ method: "GET" }).handler(async () => {
  const { shouldExposeCoopVerificationLink } = await import("@/lib/config.server");
  if (!shouldExposeCoopVerificationLink()) {
    return { expose: false as const };
  }

  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) {
    return { expose: false as const };
  }

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");

  await connectDB();
  const user = await User.findById(session.data.userId).select(
    "+emailVerificationCode +emailVerificationExpires",
  );
  if (!user?.cooperativeMember || user.emailVerified) {
    return { expose: false as const };
  }

  const expired =
    !user.emailVerificationExpires || user.emailVerificationExpires.getTime() <= Date.now();
  let code = user.emailVerificationCode;

  if (!code || expired) {
    const credentials = await createVerificationCredentials(user._id.toString());
    code = credentials.code;
  }

  return { expose: true as const, code };
});

export const verifyCoopEmailByCodeFn = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") }))
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) {
      return { error: "You must be signed in." as const };
    }

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const user = await User.findById(session.data.userId).select(
      "+emailVerificationCode +emailVerificationExpires",
    );

    if (!user?.cooperativeMember) {
      return { error: "Not a co-operative member." as const };
    }

    if (user.emailVerified) {
      throw redirect({ to: "/co-operative/complete-profile" });
    }

    const expired =
      !user.emailVerificationExpires || user.emailVerificationExpires.getTime() <= Date.now();
    if (!user.emailVerificationCode || expired) {
      return { error: "Your verification code has expired. Resend a new one." as const };
    }

    if (user.emailVerificationCode !== data.code) {
      return { error: "Invalid verification code." as const };
    }

    return finalizeCoopEmailVerification(user._id.toString());
  });

export const verifyCoopEmailFn = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { getDataPepper } = await import("@/lib/config.server");
    const { hashToken } = await import("@/lib/auth-utils.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();

    const pepper = getDataPepper();
    const tokenHash = hashToken(data.token, pepper);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
      cooperativeMember: true,
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!user) {
      return { error: "This verification link is invalid or has expired." as const };
    }

    return finalizeCoopEmailVerification(user._id.toString());
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
