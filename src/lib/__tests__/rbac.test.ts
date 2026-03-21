import { describe, it, expect } from "vitest";
import { hasPermission, requirePermission, PERMISSIONS } from "../rbac";

describe("hasPermission", () => {
  describe("admin role", () => {
    it("has all permissions", () => {
      for (const perm of PERMISSIONS) {
        expect(hasPermission("admin", perm)).toBe(true);
      }
    });
  });

  describe("doctor role", () => {
    const doctorPermissions = [
      "view_patients",
      "manage_patients",
      "manage_consultations",
      "view_repertory",
      "manage_agenda",
      "manage_documents",
    ];

    it("has correct permissions", () => {
      for (const perm of doctorPermissions) {
        expect(hasPermission("doctor", perm)).toBe(true);
      }
    });

    it("does NOT have admin-only permissions", () => {
      const adminOnly = PERMISSIONS.filter(
        (p) => !doctorPermissions.includes(p)
      );
      for (const perm of adminOnly) {
        expect(hasPermission("doctor", perm)).toBe(false);
      }
    });
  });

  describe("secretary role", () => {
    const secretaryPermissions = [
      "view_patients",
      "manage_agenda",
      "view_financial",
    ];

    it("has correct permissions", () => {
      for (const perm of secretaryPermissions) {
        expect(hasPermission("secretary", perm)).toBe(true);
      }
    });

    it("does NOT have clinical permissions", () => {
      expect(hasPermission("secretary", "manage_patients")).toBe(false);
      expect(hasPermission("secretary", "manage_consultations")).toBe(false);
      expect(hasPermission("secretary", "manage_billing")).toBe(false);
      expect(hasPermission("secretary", "manage_documents")).toBe(false);
    });
  });

  describe("intern role", () => {
    const internPermissions = ["view_patients", "view_repertory"];

    it("has correct permissions", () => {
      for (const perm of internPermissions) {
        expect(hasPermission("intern", perm)).toBe(true);
      }
    });

    it("does NOT have any management permissions", () => {
      expect(hasPermission("intern", "manage_patients")).toBe(false);
      expect(hasPermission("intern", "manage_consultations")).toBe(false);
      expect(hasPermission("intern", "manage_agenda")).toBe(false);
      expect(hasPermission("intern", "manage_financial")).toBe(false);
    });
  });

  describe("unknown role", () => {
    it("returns false for all permissions", () => {
      expect(hasPermission("unknown", "view_patients")).toBe(false);
      expect(hasPermission("", "view_patients")).toBe(false);
    });
  });

  describe("unknown permission", () => {
    it("returns false for non-existent permission", () => {
      expect(hasPermission("admin", "fly_to_moon")).toBe(false);
    });
  });
});

describe("requirePermission", () => {
  it("does not throw for admin with any permission", () => {
    const session = { user: { role: "admin" } };
    expect(() =>
      requirePermission(session, "manage_billing")
    ).not.toThrow();
  });

  it("throws for doctor without manage_billing", () => {
    const session = { user: { role: "doctor" } };
    expect(() =>
      requirePermission(session, "manage_billing")
    ).toThrow("Permissão negada");
  });

  it("does not throw for doctor with view_patients", () => {
    const session = { user: { role: "doctor" } };
    expect(() =>
      requirePermission(session, "view_patients")
    ).not.toThrow();
  });

  it("includes role and permission in error message", () => {
    const session = { user: { role: "doctor" } };
    expect(() =>
      requirePermission(session, "manage_billing")
    ).toThrow(/manage_billing.*doctor/);
  });
});
