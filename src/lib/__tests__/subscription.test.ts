import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockClinicFindUniqueOrThrow = vi.fn();
const mockPatientCount = vi.fn();
const mockConsultationCount = vi.fn();
const mockUserCount = vi.fn();
const mockInviteCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clinic: { findUniqueOrThrow: (...args: unknown[]) => mockClinicFindUniqueOrThrow(...args) },
    patient: { count: (...args: unknown[]) => mockPatientCount(...args) },
    consultation: { count: (...args: unknown[]) => mockConsultationCount(...args) },
    user: { count: (...args: unknown[]) => mockUserCount(...args) },
    clinicInvite: { count: (...args: unknown[]) => mockInviteCount(...args) },
  },
}));

import {
  checkPatientLimit,
  checkConsultationLimit,
  checkUserLimit,
  requireActiveSubscription,
} from "../subscription";

describe("checkPatientLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows when under limit", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: 10,
      maxUsersPerClinic: 1,
    });
    mockPatientCount.mockResolvedValue(5);

    await expect(checkPatientLimit("clinic-1")).resolves.toBeUndefined();
  });

  it("throws when at limit", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: 10,
      maxUsersPerClinic: 1,
    });
    mockPatientCount.mockResolvedValue(10);

    await expect(checkPatientLimit("clinic-1")).rejects.toThrow(
      "Limite de pacientes atingido"
    );
  });

  it("allows unlimited when maxPatients is -1", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: -1,
      maxUsersPerClinic: 1,
    });

    await expect(checkPatientLimit("clinic-1")).resolves.toBeUndefined();
    // Patient count should not even be called
    expect(mockPatientCount).not.toHaveBeenCalled();
  });
});

describe("checkConsultationLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows when under limit", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: 10,
      maxUsersPerClinic: 1,
    });
    mockConsultationCount.mockResolvedValue(15);

    await expect(checkConsultationLimit("clinic-1")).resolves.toBeUndefined();
  });

  it("throws when at monthly limit", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: 10,
      maxUsersPerClinic: 1,
    });
    mockConsultationCount.mockResolvedValue(20);

    await expect(checkConsultationLimit("clinic-1")).rejects.toThrow(
      "Limite de consultas mensais atingido"
    );
  });

  it("allows unlimited consultations for professional plan", async () => {
    vi.stubEnv("STRIPE_PRICE_PROFESSIONAL", "price_pro");
    vi.resetModules();

    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: "price_pro",
      maxPatients: 500,
      maxUsersPerClinic: 3,
    });

    // Re-import after env change
    const { checkConsultationLimit: check } = await import("../subscription");
    await expect(check("clinic-1")).resolves.toBeUndefined();
    expect(mockConsultationCount).not.toHaveBeenCalled();

    vi.unstubAllEnvs();
  });
});

describe("checkUserLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts active users + pending invites", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: 10,
      maxUsersPerClinic: 1,
    });
    mockUserCount.mockResolvedValue(0);
    mockInviteCount.mockResolvedValue(0);

    await expect(checkUserLimit("clinic-1")).resolves.toBeUndefined();
  });

  it("throws when users + invites exceed limit", async () => {
    mockClinicFindUniqueOrThrow.mockResolvedValue({
      stripePriceId: null,
      maxPatients: 10,
      maxUsersPerClinic: 1,
    });
    mockUserCount.mockResolvedValue(1);
    mockInviteCount.mockResolvedValue(0);

    await expect(checkUserLimit("clinic-1")).rejects.toThrow(
      "Limite de usuários atingido"
    );
  });
});

describe("requireActiveSubscription", () => {
  it("does not throw for active status", () => {
    expect(() => requireActiveSubscription("active")).not.toThrow();
  });

  it("does not throw for trialing status", () => {
    expect(() => requireActiveSubscription("trialing")).not.toThrow();
  });

  it("throws for canceled status", () => {
    expect(() => requireActiveSubscription("canceled")).toThrow(
      "Assinatura inativa"
    );
  });

  it("throws for past_due status", () => {
    expect(() => requireActiveSubscription("past_due")).toThrow(
      "Assinatura inativa"
    );
  });

  it("throws for unknown status", () => {
    expect(() => requireActiveSubscription("unknown")).toThrow(
      "Assinatura inativa"
    );
  });
});
