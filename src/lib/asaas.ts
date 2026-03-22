import { prisma } from "@/lib/prisma";

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? "";

async function asaasRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY is not configured");
  }

  const url = `${ASAAS_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
      ...(options.headers ?? {}),
    },
  });

  return res;
}

/**
 * Finds or creates an Asaas customer for a clinic.
 */
export async function getOrCreateAsaasCustomer(
  clinicId: string,
  email: string,
  name: string,
  cpfCnpj?: string | null
): Promise<string> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: { stripeCustomerId: true, cnpj: true },
  });

  // Reuse stripeCustomerId field for Asaas customer ID
  if (clinic.stripeCustomerId) {
    return clinic.stripeCustomerId;
  }

  const body: Record<string, string> = {
    name,
    email,
    externalReference: clinicId,
    notificationDisabled: "false",
  };

  // Use CNPJ from clinic or provided cpfCnpj
  const doc = cpfCnpj ?? clinic.cnpj;
  if (doc) {
    body.cpfCnpj = doc.replace(/[^\d]/g, "");
  }

  const res = await asaasRequest("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Asaas customer creation failed: ${JSON.stringify(err)}`);
  }

  const customer = await res.json();

  await prisma.clinic.update({
    where: { id: clinicId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Creates an Asaas subscription for a clinic.
 * Returns the payment link URL for the first invoice.
 */
export async function createAsaasSubscription(
  clinicId: string,
  plan: "professional" | "enterprise",
  successUrl: string
): Promise<{ subscriptionId: string; paymentUrl: string }> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: { stripeCustomerId: true, email: true, name: true, cnpj: true },
  });

  const customerId = await getOrCreateAsaasCustomer(
    clinicId,
    clinic.email ?? "",
    clinic.name,
    clinic.cnpj
  );

  const value = plan === "professional" ? 149.0 : 349.0;
  const description =
    plan === "professional"
      ? "HomeoClinic Pro - Profissional"
      : "HomeoClinic Pro - Enterprise";

  // Calculate next due date (tomorrow)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  const res = await asaasRequest("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: customerId,
      billingType: "UNDEFINED", // Allows PIX, boleto, or credit card
      value,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description,
      externalReference: `${clinicId}:${plan}`,
      callback: {
        successUrl,
        autoRedirect: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Asaas subscription failed: ${JSON.stringify(err)}`);
  }

  const subscription = await res.json();

  // Update clinic with subscription info
  await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: plan,
      subscriptionStatus: "pending",
    },
  });

  // Get the first payment link
  const paymentsRes = await asaasRequest(
    `/subscriptions/${subscription.id}/payments?limit=1`
  );
  let paymentUrl = successUrl;

  if (paymentsRes.ok) {
    const payments = await paymentsRes.json();
    if (payments.data?.[0]?.invoiceUrl) {
      paymentUrl = payments.data[0].invoiceUrl;
    } else if (payments.data?.[0]?.id) {
      // Generate payment link
      paymentUrl = `https://www.asaas.com/i/${payments.data[0].id}`;
    }
  }

  return { subscriptionId: subscription.id, paymentUrl };
}

/**
 * Gets the Asaas customer portal URL (list of payments/invoices).
 */
export async function getAsaasPaymentUrl(
  customerId: string
): Promise<string> {
  // Asaas doesn't have a customer portal like Stripe.
  // We generate a link to the latest payment/invoice instead.
  const res = await asaasRequest(
    `/payments?customer=${customerId}&limit=5&status=PENDING`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Asaas payments");
  }

  const data = await res.json();
  if (data.data?.[0]?.invoiceUrl) {
    return data.data[0].invoiceUrl;
  }

  // Fallback: link to all payments for this customer
  return `https://www.asaas.com/payments?customer=${customerId}`;
}

/**
 * Cancels an Asaas subscription.
 */
export async function cancelAsaasSubscription(
  subscriptionId: string
): Promise<void> {
  const res = await asaasRequest(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Asaas cancellation failed: ${JSON.stringify(err)}`);
  }
}

/**
 * Fetches subscription details from Asaas.
 */
export async function getAsaasSubscription(
  subscriptionId: string
): Promise<Record<string, unknown> | null> {
  const res = await asaasRequest(`/subscriptions/${subscriptionId}`);
  if (!res.ok) return null;
  return res.json();
}
