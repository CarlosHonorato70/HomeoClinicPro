export type PlanKey = "free" | "professional" | "enterprise";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  maxPatients: number;
  maxUsers: number;
  maxConsultationsPerMonth: number;
  priceId: string | null;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  free: {
    key: "free",
    name: "Gratuito",
    maxPatients: 10,
    maxUsers: 1,
    maxConsultationsPerMonth: 20,
    priceId: null,
  },
  professional: {
    key: "professional",
    name: "Profissional",
    maxPatients: 500,
    maxUsers: 3,
    maxConsultationsPerMonth: -1,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? "professional",
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    maxPatients: -1,
    maxUsers: 12,
    maxConsultationsPerMonth: -1,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? "enterprise",
  },
};

/**
 * Resolves a Stripe priceId to its plan definition.
 * Returns the free plan if no match is found.
 */
export function getPlanFromPriceId(priceId: string | null): PlanDefinition {
  if (!priceId) return PLANS.free;

  const found = Object.values(PLANS).find((p) => p.priceId === priceId);
  return found ?? PLANS.free;
}

/**
 * Returns the effective limits for a clinic based on its current plan.
 */
export function getClinicLimits(clinic: {
  stripePriceId?: string | null;
  maxPatients?: number;
  maxUsersPerClinic?: number;
}): {
  maxPatients: number;
  maxUsers: number;
  maxConsultationsPerMonth: number;
  plan: PlanDefinition;
} {
  const plan = getPlanFromPriceId(clinic.stripePriceId ?? null);

  return {
    maxPatients: clinic.maxPatients ?? plan.maxPatients,
    maxUsers: clinic.maxUsersPerClinic ?? plan.maxUsers,
    maxConsultationsPerMonth: plan.maxConsultationsPerMonth,
    plan,
  };
}
