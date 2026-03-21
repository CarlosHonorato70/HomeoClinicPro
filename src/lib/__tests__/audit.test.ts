import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing audit
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() =>
    Promise.resolve(
      new Map([
        ["x-forwarded-for", "192.168.1.1, 10.0.0.1"],
        ["x-real-ip", "192.168.1.1"],
      ])
    )
  ),
}));

import { logAudit, AuditActions, getClientIp } from "../audit";
import { prisma } from "@/lib/prisma";

describe("AuditActions", () => {
  it("has all expected action types", () => {
    expect(AuditActions.LOGIN).toBe("LOGIN");
    expect(AuditActions.PATIENT_NEW).toBe("PATIENT_NEW");
    expect(AuditActions.LGPD_EXPORT).toBe("LGPD_EXPORT");
    expect(AuditActions.LGPD_ANONYMIZE).toBe("LGPD_ANONYMIZE");
    expect(AuditActions.CONSULTATION_NEW).toBe("CONSULTATION_NEW");
    expect(AuditActions.SUPERADMIN_PLAN_CHANGE).toBe("SUPERADMIN_PLAN_CHANGE");
  });

  it("has unique values for all actions", () => {
    const values = Object.values(AuditActions);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates audit log entry with provided data", async () => {
    await logAudit({
      clinicId: "clinic-1",
      userId: "user-1",
      action: AuditActions.LOGIN,
      details: "Login successful",
      ip: "10.0.0.1",
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        clinicId: "clinic-1",
        userId: "user-1",
        action: "LOGIN",
        details: "Login successful",
        ip: "10.0.0.1",
      },
    });
  });

  it("creates audit log without optional fields", async () => {
    await logAudit({
      clinicId: "clinic-1",
      action: AuditActions.PATIENT_NEW,
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: "clinic-1",
        action: "PATIENT_NEW",
        userId: undefined,
        details: undefined,
      }),
    });
  });
});

describe("getClientIp", () => {
  it("extracts first IP from x-forwarded-for", async () => {
    const ip = await getClientIp();
    expect(ip).toBe("192.168.1.1");
  });
});
