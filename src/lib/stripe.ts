import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Return a proxy that throws on any method call — allows build to succeed
    // without a real Stripe key
    return new Proxy({} as Stripe, {
      get(_target, prop) {
        if (prop === "webhooks") {
          return {
            constructEvent: () => {
              throw new Error("STRIPE_SECRET_KEY is not configured");
            },
          };
        }
        return new Proxy(() => {}, {
          get() {
            return () => {
              throw new Error("STRIPE_SECRET_KEY is not configured");
            };
          },
          apply() {
            throw new Error("STRIPE_SECRET_KEY is not configured");
          },
        });
      },
    });
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });
}

export const stripe = createStripeClient();

/**
 * Finds or creates a Stripe customer for a clinic and persists the stripeCustomerId.
 */
export async function getOrCreateStripeCustomer(
  clinicId: string,
  email: string,
  name: string
): Promise<string> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: { stripeCustomerId: true },
  });

  if (clinic.stripeCustomerId) {
    return clinic.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { clinicId },
  });

  await prisma.clinic.update({
    where: { id: clinicId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Creates a Stripe Checkout Session for a subscription.
 */
export async function createCheckoutSession(
  clinicId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  const customerId = await getOrCreateStripeCustomer(
    clinicId,
    clinic.email ?? "",
    clinic.name
  );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card", "boleto"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: "pt-BR",
    metadata: { clinicId },
    subscription_data: {
      metadata: { clinicId },
    },
  });

  return session;
}

/**
 * Creates a Stripe Customer Portal session so the clinic can manage billing.
 */
export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}
