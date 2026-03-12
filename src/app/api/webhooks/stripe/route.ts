import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId } from "@/lib/plans";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clinicId = session.metadata?.clinicId;

        if (!clinicId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const firstItem = subscription.items.data[0];
        const priceId = firstItem?.price.id ?? null;
        const plan = getPlanFromPriceId(priceId);
        const periodEnd = firstItem?.current_period_end;

        await prisma.clinic.update({
          where: { id: clinicId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            maxPatients: plan.maxPatients,
            maxUsersPerClinic: plan.maxUsers,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clinicId = subscription.metadata?.clinicId;

        if (!clinicId) break;

        const firstItem = subscription.items.data[0];
        const priceId = firstItem?.price.id ?? null;
        const plan = getPlanFromPriceId(priceId);
        const periodEnd = firstItem?.current_period_end;

        await prisma.clinic.update({
          where: { id: clinicId },
          data: {
            stripePriceId: priceId,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            maxPatients: plan.maxPatients,
            maxUsersPerClinic: plan.maxUsers,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clinicId = subscription.metadata?.clinicId;

        if (!clinicId) break;

        await prisma.clinic.update({
          where: { id: clinicId },
          data: {
            subscriptionStatus: "canceled",
            stripePriceId: null,
            maxPatients: 10,
            maxUsersPerClinic: 1,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof sub === "string" ? sub : sub?.id ?? null;

        if (!subscriptionId) break;

        const clinic = await prisma.clinic.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          select: { id: true },
        });

        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: { subscriptionStatus: "past_due" },
          });
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error("Error processing webhook event:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
