import { describe, it, expect, vi, beforeEach } from "vitest";

describe("plans", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("STRIPE_PRICE_PROFESSIONAL", "price_pro_123");
    vi.stubEnv("STRIPE_PRICE_ENTERPRISE", "price_ent_456");
  });

  it("getPlanFromPriceId returns free plan for null", async () => {
    const { getPlanFromPriceId } = await import("../plans");
    const plan = getPlanFromPriceId(null);
    expect(plan.key).toBe("free");
    expect(plan.maxPatients).toBe(10);
  });

  it("getPlanFromPriceId returns free plan for unknown priceId", async () => {
    const { getPlanFromPriceId } = await import("../plans");
    const plan = getPlanFromPriceId("price_unknown");
    expect(plan.key).toBe("free");
  });

  it("getPlanFromPriceId matches professional plan", async () => {
    const { getPlanFromPriceId } = await import("../plans");
    const plan = getPlanFromPriceId("price_pro_123");
    expect(plan.key).toBe("professional");
    expect(plan.maxPatients).toBe(500);
    expect(plan.maxUsers).toBe(3);
    expect(plan.maxConsultationsPerMonth).toBe(-1); // unlimited
  });

  it("getPlanFromPriceId matches enterprise plan", async () => {
    const { getPlanFromPriceId } = await import("../plans");
    const plan = getPlanFromPriceId("price_ent_456");
    expect(plan.key).toBe("enterprise");
    expect(plan.maxPatients).toBe(-1); // unlimited
  });

  it("getClinicLimits uses plan defaults", async () => {
    const { getClinicLimits } = await import("../plans");
    const limits = getClinicLimits({ stripePriceId: null });
    expect(limits.maxPatients).toBe(10);
    expect(limits.maxUsers).toBe(1);
    expect(limits.plan.key).toBe("free");
  });

  it("getClinicLimits uses clinic overrides when present", async () => {
    const { getClinicLimits } = await import("../plans");
    const limits = getClinicLimits({
      stripePriceId: null,
      maxPatients: 50,
      maxUsersPerClinic: 5,
    });
    expect(limits.maxPatients).toBe(50); // overridden
    expect(limits.maxUsers).toBe(5); // overridden
    expect(limits.plan.key).toBe("free"); // still free plan
  });

  it("free plan has correct limits", async () => {
    const { PLANS } = await import("../plans");
    expect(PLANS.free.maxPatients).toBe(10);
    expect(PLANS.free.maxUsers).toBe(1);
    expect(PLANS.free.maxConsultationsPerMonth).toBe(20);
    expect(PLANS.free.priceId).toBeNull();
  });

  it("professional plan has unlimited consultations", async () => {
    const { PLANS } = await import("../plans");
    expect(PLANS.professional.maxConsultationsPerMonth).toBe(-1);
  });

  it("enterprise plan has unlimited patients", async () => {
    const { PLANS } = await import("../plans");
    expect(PLANS.enterprise.maxPatients).toBe(-1);
  });
});
