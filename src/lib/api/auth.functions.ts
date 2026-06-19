import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { z } from "zod";

import type { SafeUser } from "@/lib/types";
import { isValidNgPhone, storeNgPhone } from "@/lib/phone";

const phoneField = z
  .string()
  .min(10, "Enter a valid Nigerian phone number")
  .refine(isValidNgPhone, "Use format 08012345678 or +2348012345678");

const signUpSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: phoneField,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const kycSchema = z.object({
  fullName: z.string().min(2),
  phone: phoneField,
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  bvn: z.string().length(11, "BVN must be 11 digits").regex(/^\d+$/, "BVN must be numeric"),
  nin: z
    .string()
    .length(11, "NIN must be 11 digits")
    .regex(/^\d+$/, "NIN must be numeric")
    .optional()
    .or(z.literal("")),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2),
  phone: phoneField,
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(2),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits")
    .optional()
    .or(z.literal("")),
  accountName: z.string().min(2),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const getAuthUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SafeUser | null> => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return null;

    try {
      const { connectDB } = await import("@/lib/db.server");
      const { User } = await import("@/lib/models/user.model.server");
      const { toSafeUser } = await import("@/lib/auth-utils.server");

      await connectDB();
      const user = await User.findById(session.data.userId);
      if (!user) {
        await session.clear();
        return null;
      }
      return {
        ...toSafeUser(user),
        kycRejectionReason: user.kycRejectionReason ?? undefined,
        createdAt: user.createdAt?.toISOString?.(),
      };
    } catch {
      return null;
    }
  },
);

export const signUpFn = createServerFn({ method: "POST" })
  .validator(signUpSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { useAppSession } = await import("@/lib/session.server");
    const { getOrCreateWallet } = await import("@/lib/wallet.server");

    await connectDB();

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      email: data.email.toLowerCase(),
      phone: storeNgPhone(data.phone) ?? data.phone,
      passwordHash,
      fullName: data.fullName,
      role: "investor",
      kycStatus: "pending",
    });

    await getOrCreateWallet(user._id.toString());

    const session = await useAppSession();
    await session.update({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    });

    throw redirect({ to: "/auth/kyc" });
  });

export const signInFn = createServerFn({ method: "POST" })
  .validator(signInSchema)
  .handler(async ({ data }) => {
    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { useAppSession } = await import("@/lib/session.server");

    await connectDB();

    const user = await User.findOne({ email: data.email.toLowerCase() }).select(
      "+passwordHash",
    );
    if (!user) {
      return { error: "Invalid email or password." };
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return { error: "Invalid email or password." };
    }

    const session = await useAppSession();
    await session.update({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    });

    if (user.role === "admin" || user.role === "super_admin") {
      throw redirect({ to: "/admin" });
    }

    if (user.role === "field_officer") {
      throw redirect({ to: "/field" });
    }

    if (user.kycStatus === "pending" || user.kycStatus === "rejected") {
      throw redirect({ to: "/auth/kyc" });
    }

    throw redirect({ to: "/app" });
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: "/" });
});

export const submitKycFn = createServerFn({ method: "POST" })
  .validator(kycSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) {
      return { error: "You must be signed in to complete KYC." };
    }

    const { connectDB } = await import("@/lib/db.server");
    const { getServerConfig } = await import("@/lib/config.server");
    const { hashSensitive } = await import("@/lib/auth-utils.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const { sessionSecret } = getServerConfig();
    const pepper = sessionSecret ?? "dev-only-change-me-32-chars-min!!";

    const user = await User.findById(session.data.userId).select("+bvnHash +ninHash");
    if (!user) {
      return { error: "Account not found." };
    }

    user.fullName = data.fullName;
    user.phone = storeNgPhone(data.phone) ?? data.phone;
    user.address = data.address;
    user.city = data.city;
    user.state = data.state;
    user.bvnHash = hashSensitive(data.bvn, pepper);
    if (data.nin) {
      user.ninHash = hashSensitive(data.nin, pepper);
    }
    user.kycStatus = "submitted";
    user.kycRejectionReason = undefined;
    await user.save();

    await session.update({ kycStatus: "submitted" });

    return { success: true as const };
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator(updateProfileSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const user = await User.findById(session.data.userId);
    if (!user) return { error: "Account not found." as const };

    user.fullName = data.fullName;
    user.phone = storeNgPhone(data.phone) ?? data.phone;
    await user.save();

    return { success: true as const };
  });

export const changePasswordFn = createServerFn({ method: "POST" })
  .validator(changePasswordSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const user = await User.findById(session.data.userId).select("+passwordHash");
    if (!user) return { error: "Account not found." as const };

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return { error: "Current password is incorrect." as const };

    user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    await user.save();

    return { success: true as const };
  });

export const updateBankDetailsFn = createServerFn({ method: "POST" })
  .validator(bankDetailsSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) return { error: "Unauthorized" as const };

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const user = await User.findById(session.data.userId);
    if (!user) return { error: "Account not found." as const };

    user.bankName = data.bankName.trim();
    const accountNumber = data.accountNumber?.trim() ?? "";
    if (accountNumber) {
      user.accountNumber = accountNumber;
    } else if (!user.accountNumber) {
      return { error: "Account number is required." as const };
    }
    user.accountName = data.accountName.trim();
    await user.save();

    return { success: true as const };
  });

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .validator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const { createHash, randomBytes } = await import("node:crypto");
    const { connectDB } = await import("@/lib/db.server");
    const { getServerConfig } = await import("@/lib/config.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { sendPasswordResetEmail } = await import("@/lib/email.server");

    await connectDB();
    const user = await User.findOne({ email: data.email.toLowerCase() }).select(
      "+passwordResetTokenHash +passwordResetExpires",
    );

    if (!user) {
      return { success: true as const };
    }

    const token = randomBytes(32).toString("hex");
    const { sessionSecret } = getServerConfig();
    const pepper = sessionSecret ?? "dev-only-change-me-32-chars-min!!";
    user.passwordResetTokenHash = createHash("sha256")
      .update(`${pepper}:${token}`)
      .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const appUrl = process.env.APP_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080");
    const resetUrl = `${appUrl.replace(/\/$/, "")}/auth/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (err) {
      console.error("[requestPasswordReset]", err);
    }

    return { success: true as const };
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { createHash } = await import("node:crypto");
    const { connectDB } = await import("@/lib/db.server");
    const { getServerConfig } = await import("@/lib/config.server");
    const { User } = await import("@/lib/models/user.model.server");

    await connectDB();
    const { sessionSecret } = getServerConfig();
    const pepper = sessionSecret ?? "dev-only-change-me-32-chars-min!!";
    const tokenHash = createHash("sha256").update(`${pepper}:${data.token}`).digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires +passwordHash");

    if (!user) {
      return { error: "This reset link is invalid or has expired." as const };
    }

    user.passwordHash = await bcrypt.hash(data.password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { success: true as const };
  });
