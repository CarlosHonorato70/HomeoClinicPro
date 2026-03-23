import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * Asaas webhook handler.
 * Receives events: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE,
 * PAYMENT_DELETED, PAYMENT_REFUNDED, SUBSCRIPTION_DELETED, etc.
 */
export async function POST(req: Request) {
  const body = await req.json();

  // Validate webhook token (required)
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!webhookToken) {
    console.error("[Asaas Webhook] ASAAS_WEBHOOK_TOKEN not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("asaas-access-token");
  if (authHeader !== webhookToken) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const event = body.event;
  const payment = body.payment;
  const subscription = body.subscription;

  try {
    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Payment successful — activate subscription
        if (!payment?.subscription) break;

        // Find clinic by subscription ID
        const clinic = await prisma.clinic.findFirst({
          where: { stripeSubscriptionId: payment.subscription },
        });

        if (!clinic) break;

        const plan = getPlanFromPriceId(clinic.stripePriceId);

        // Calculate next period end (payment.dueDate + 30 days)
        const periodEnd = payment.dueDate
          ? new Date(new Date(payment.dueDate).getTime() + 30 * 24 * 60 * 60 * 1000)
          : null;

        await prisma.clinic.update({
          where: { id: clinic.id },
          data: {
            subscriptionStatus: "active",
            currentPeriodEnd: periodEnd,
            maxPatients: plan.maxPatients,
            maxUsersPerClinic: plan.maxUsers,
          },
        });
        break;
      }

      case "PAYMENT_OVERDUE": {
        // Payment overdue — mark as past_due
        if (!payment?.subscription) break;

        const clinic = await prisma.clinic.findFirst({
          where: { stripeSubscriptionId: payment.subscription },
        });

        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: { subscriptionStatus: "past_due" },
          });
        }
        break;
      }

      case "PAYMENT_DELETED":
      case "PAYMENT_REFUNDED": {
        // Payment deleted/refunded
        if (!payment?.subscription) break;

        const clinic = await prisma.clinic.findFirst({
          where: { stripeSubscriptionId: payment.subscription },
        });

        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: { subscriptionStatus: "past_due" },
          });
        }
        break;
      }

      case "SUBSCRIPTION_DELETED":
      case "SUBSCRIPTION_INACTIVE": {
        // Subscription canceled — reset to free plan
        const subId = subscription ?? body.id;
        if (!subId) break;

        const clinic = await prisma.clinic.findFirst({
          where: { stripeSubscriptionId: subId },
        });

        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: {
              subscriptionStatus: "canceled",
              stripePriceId: null,
              maxPatients: 10,
              maxUsersPerClinic: 1,
            },
          });
        }
        break;
      }

      default:
        // Unhandled event — ignore
        break;
    }
  } catch (err) {
    console.error("Error processing Asaas webhook:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
