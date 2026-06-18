import { createFileRoute } from "@tanstack/react-router";

import { connectDB } from "@/lib/db.server";
import { creditWallet } from "@/lib/wallet.server";
import { verifyPaystackSignature } from "@/lib/paystack.server";

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: { userId?: string };
    customer?: { email?: string };
  };
}

export const Route = createFileRoute("/api/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-paystack-signature");

        if (!verifyPaystackSignature(rawBody, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: PaystackWebhookEvent;
        try {
          event = JSON.parse(rawBody) as PaystackWebhookEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        if (event.event === "charge.success" && event.data.status === "success") {
          try {
            await connectDB();
            const amountNaira = event.data.amount / 100;
            const userId = event.data.metadata?.userId;

            if (!userId) {
              console.error("Paystack webhook missing userId metadata", event.data.reference);
              return Response.json({ received: true });
            }

            const { Transaction } = await import("@/lib/models/transaction.model.server");
            const existing = await Transaction.findOne({ reference: event.data.reference });
            if (existing?.status === "completed") {
              return Response.json({ received: true });
            }

            const { transaction } = await creditWallet({
              userId,
              amount: amountNaira,
              type: "deposit",
              reference: event.data.reference,
              externalReference: event.data.reference,
              metadata: { paystackEvent: event.event },
            });

            const { User } = await import("@/lib/models/user.model.server");
            const { notifySafe, sendDepositReceiptEmail } = await import("@/lib/email.server");
            const { createNotification, notifySafe: notify } = await import(
              "@/lib/notifications.server"
            );
            const { formatNaira } = await import("@/lib/format");

            const user = await User.findById(userId);
            if (user) {
              await notifySafe(
                () => sendDepositReceiptEmail(user.email, user.fullName, amountNaira),
                "deposit-receipt",
              );
            }

            await notify(
              () =>
                createNotification({
                  userId,
                  type: "deposit",
                  title: "Wallet deposit received",
                  body: `${formatNaira(amountNaira)} has been added to your wallet.`,
                  link: `/app/reports/${transaction._id.toString()}/receipt`,
                }),
              "deposit-notification",
            );
          } catch (err) {
            console.error("Paystack webhook processing error:", err);
            return new Response("Processing failed", { status: 500 });
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
