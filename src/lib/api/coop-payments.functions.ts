import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateReference } from "@/lib/format";
import type { CoopPaymentRow, ManualPaymentPurpose } from "@/lib/types";

const PURPOSE_LABEL: Record<ManualPaymentPurpose, string> = {
  entrance_fee: "Membership entrance fee",
  investment_deposit: "Investment funding",
};

const submitSchema = z.object({
  purpose: z.enum(["entrance_fee", "investment_deposit"]),
  amount: z.number().positive("Enter the amount you paid"),
  payerAccountName: z.string().min(2, "Enter the name on the account you paid from"),
  payerBankName: z.string().min(2, "Enter the bank you paid from"),
  transferReference: z.string().optional(),
  transferDate: z.string().optional(),
  // The receipt is uploaded browser-side to Vercel Blob (see /api/coop/upload);
  // only the resulting public URL reaches the server.
  receiptUrl: z.string().url("Upload your payment receipt"),
});

/**
 * Submit a manual bank-transfer payment with a receipt URL.
 * Used for both the entrance fee and investment funding.
 */
export const submitCoopPaymentFn = createServerFn({ method: "POST" })
  .validator(submitSchema)
  .handler(async ({ data }) => {
    const { useAppSession } = await import("@/lib/session.server");
    const session = await useAppSession();
    if (!session.data.userId) {
      return { error: "You must be signed in." as const };
    }

    const { connectDB } = await import("@/lib/db.server");
    const { User } = await import("@/lib/models/user.model.server");
    const { ManualPayment } = await import("@/lib/models/manual-payment.model.server");
    const { getCoopEntranceFee } = await import("@/lib/config.server");
    const { notifySafe, sendCoopPaymentReceivedEmail } = await import("@/lib/email.server");

    await connectDB();
    const user = await User.findById(session.data.userId);
    if (!user?.cooperativeMember) {
      return { error: "Not a co-operative member." as const };
    }

    const entranceFee = getCoopEntranceFee();

    if (data.purpose === "entrance_fee") {
      if (user.membershipStatus !== "payment_pending") {
        return {
          error:
            user.membershipStatus === "provisional_member"
              ? ("Complete your profile before paying the entrance fee." as const)
              : ("Your entrance fee has already been recorded." as const),
        };
      }
      if (data.amount < entranceFee) {
        return { error: `The entrance fee is ₦${entranceFee.toLocaleString()}.` as const };
      }
    } else {
      const canFund =
        user.membershipStatus === "full_member" ||
        user.membershipStatus === "funded" ||
        user.membershipStatus === "active_investor";
      if (!canFund) {
        return { error: "Become a full member before funding your investment account." as const };
      }
    }

    const dupe = await ManualPayment.findOne({
      userId: user._id,
      purpose: data.purpose,
      status: "pending",
    });
    if (dupe) {
      return { error: "You already have a payment of this type awaiting confirmation." as const };
    }

    await ManualPayment.create({
      userId: user._id,
      membershipNumber: user.membershipNumber,
      purpose: data.purpose,
      amount: data.amount,
      payerAccountName: data.payerAccountName.trim(),
      payerBankName: data.payerBankName.trim(),
      transferReference: data.transferReference?.trim() || undefined,
      transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
      receiptUrl: data.receiptUrl,
      status: "pending",
      reference: generateReference("COOP"),
    });

    await notifySafe(
      () =>
        sendCoopPaymentReceivedEmail(
          user.email,
          user.fullName,
          data.amount,
          PURPOSE_LABEL[data.purpose],
        ),
      "coop payment received email",
    );

    return { success: true as const };
  });

/** Member-facing funding page data: bank details, entrance fee, status, recent payments. */
export const getCoopFundInfoFn = createServerFn({ method: "GET" }).handler(async () => {
  const { useAppSession } = await import("@/lib/session.server");
  const session = await useAppSession();
  if (!session.data.userId) {
    return { error: "Unauthorized" as const };
  }

  const { connectDB } = await import("@/lib/db.server");
  const { User } = await import("@/lib/models/user.model.server");
  const { ManualPayment } = await import("@/lib/models/manual-payment.model.server");
  const { getCoopBankDetails, getCoopEntranceFee } = await import("@/lib/config.server");

  await connectDB();
  const user = await User.findById(session.data.userId);
  if (!user?.cooperativeMember) {
    return { error: "Not a co-operative member." as const };
  }

  const payments = await ManualPayment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);

  return {
    bank: getCoopBankDetails(),
    entranceFee: getCoopEntranceFee(),
    membershipStatus: user.membershipStatus,
    membershipNumber: user.membershipNumber,
    paymentReference: user.membershipNumber ? `GF-${user.membershipNumber}` : undefined,
    payments: payments.map(
      (p): CoopPaymentRow => ({
        id: p._id.toString(),
        purpose: p.purpose,
        amount: p.amount,
        payerAccountName: p.payerAccountName,
        payerBankName: p.payerBankName,
        transferReference: p.transferReference ?? undefined,
        transferDate: p.transferDate?.toISOString(),
        receiptUrl: p.receiptUrl,
        status: p.status,
        reference: p.reference,
        rejectionReason: p.rejectionReason ?? undefined,
        reviewedAt: p.reviewedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
      }),
    ),
  };
});

/** Admin queue of manual payments awaiting (or already) review. */
export const listCoopPaymentsFn = createServerFn({ method: "GET" })
  .validator(z.object({ status: z.enum(["all", "pending", "approved", "rejected"]).optional() }))
  .handler(async ({ data }): Promise<CoopPaymentRow[] | { error: string }> => {
    const { requireAdminSession } = await import("@/lib/api/admin-session");
    const { connectDB } = await import("@/lib/db.server");
    const { ManualPayment } = await import("@/lib/models/manual-payment.model.server");
    const { User } = await import("@/lib/models/user.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error ?? "Forbidden" };
    await connectDB();

    const filter: Record<string, unknown> = {};
    if (data.status && data.status !== "all") filter.status = data.status;

    const payments = await ManualPayment.find(filter).sort({ createdAt: -1 }).limit(200);
    const userIds = [...new Set(payments.map((p) => p.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select(
      "fullName email membershipNumber",
    );
    const byId = new Map(users.map((u) => [u._id.toString(), u]));

    return payments.map((p): CoopPaymentRow => {
      const u = byId.get(p.userId.toString());
      return {
        id: p._id.toString(),
        purpose: p.purpose,
        amount: p.amount,
        payerAccountName: p.payerAccountName,
        payerBankName: p.payerBankName,
        transferReference: p.transferReference ?? undefined,
        transferDate: p.transferDate?.toISOString(),
        receiptUrl: p.receiptUrl,
        status: p.status,
        reference: p.reference,
        rejectionReason: p.rejectionReason ?? undefined,
        reviewedAt: p.reviewedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        memberName: u?.fullName,
        memberEmail: u?.email,
        membershipNumber: p.membershipNumber ?? u?.membershipNumber ?? undefined,
      };
    });
  });

/** Admin approves or rejects a manual payment. */
export const reviewCoopPaymentFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paymentId: z.string().min(1),
      action: z.enum(["approve", "reject"]),
      rejectionReason: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("@/lib/api/admin-session");
    const { connectDB } = await import("@/lib/db.server");
    const { ManualPayment } = await import("@/lib/models/manual-payment.model.server");
    const { User } = await import("@/lib/models/user.model.server");

    const auth = await requireAdminSession();
    if ("error" in auth) return { error: auth.error ?? "Forbidden" };
    await connectDB();

    const payment = await ManualPayment.findById(data.paymentId);
    if (!payment || payment.status !== "pending") {
      return { error: "Payment not found or already reviewed." as const };
    }

    const member = await User.findById(payment.userId);
    if (!member) return { error: "Member not found." as const };

    const { createNotification, notifySafe: notifyInApp } =
      await import("@/lib/notifications.server");
    const {
      notifySafe,
      sendCoopEntranceFeeApprovedEmail,
      sendCoopDepositApprovedEmail,
      sendCoopPaymentRejectedEmail,
    } = await import("@/lib/email.server");

    if (data.action === "reject") {
      const reason = data.rejectionReason?.trim() || "The payment could not be verified.";
      payment.status = "rejected";
      payment.rejectionReason = reason;
      payment.reviewedAt = new Date();
      payment.reviewedBy = auth.admin._id;
      await payment.save();

      await notifySafe(
        () => sendCoopPaymentRejectedEmail(member.email, member.fullName, payment.amount, reason),
        "coop payment rejected email",
      );
      await notifyInApp(
        () =>
          createNotification({
            userId: member._id.toString(),
            type: "system",
            title: "Payment not confirmed",
            body: reason,
            link: "/co-operative/fund",
          }),
        "coop payment rejected notification",
      );
      return { success: true as const };
    }

    // Approve
    if (payment.purpose === "entrance_fee") {
      member.membershipStatus = "full_member";
      if (!member.admissionDate) member.admissionDate = new Date();
      await member.save();

      await notifySafe(
        () => sendCoopEntranceFeeApprovedEmail(member.email, member.fullName),
        "coop entrance fee approved email",
      );
      await notifyInApp(
        () =>
          createNotification({
            userId: member._id.toString(),
            type: "system",
            title: "You are now a full member",
            body: "Your entrance fee has been confirmed. You can now fund your investment account.",
            link: "/co-operative/dashboard",
          }),
        "coop entrance fee approved notification",
      );
    } else {
      const { creditWallet } = await import("@/lib/wallet.server");
      // Deterministic reference → creditWallet's "already completed" guard makes
      // this idempotent, so a double-approval can never double-credit.
      await creditWallet({
        userId: member._id.toString(),
        amount: payment.amount,
        type: "deposit",
        reference: `COOP-${payment.reference}`,
        metadata: { source: "coop_manual_payment", paymentReference: payment.reference },
      });
      if (member.membershipStatus === "full_member") {
        member.membershipStatus = "funded";
        await member.save();
      }

      await notifySafe(
        () => sendCoopDepositApprovedEmail(member.email, member.fullName, payment.amount),
        "coop deposit approved email",
      );
      await notifyInApp(
        () =>
          createNotification({
            userId: member._id.toString(),
            type: "deposit",
            title: "Payment confirmed",
            body: "Your payment has been credited to your investment balance.",
            link: "/co-operative/dashboard",
          }),
        "coop deposit approved notification",
      );
    }

    payment.status = "approved";
    payment.reviewedAt = new Date();
    payment.reviewedBy = auth.admin._id;
    await payment.save();

    return { success: true as const };
  });
