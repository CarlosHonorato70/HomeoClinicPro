import { vi } from "vitest";

// Standard mock sessions for testing
export const mockAdminSession = {
  user: {
    id: "user-admin-1",
    name: "Dr. Admin",
    email: "admin@clinic.com",
    role: "admin",
    clinicId: "clinic-1",
    subscriptionStatus: "active",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockDoctorSession = {
  user: {
    id: "user-doctor-1",
    name: "Dr. Doctor",
    email: "doctor@clinic.com",
    role: "doctor",
    clinicId: "clinic-1",
    subscriptionStatus: "active",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockTrialingSession = {
  user: {
    id: "user-trial-1",
    name: "Dr. Trial",
    email: "trial@clinic.com",
    role: "admin",
    clinicId: "clinic-trial-1",
    subscriptionStatus: "trialing",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Helper to mock getServerSession for API route tests
export function mockGetServerSession(session: unknown) {
  vi.mock("next-auth", () => ({
    getServerSession: vi.fn(() => Promise.resolve(session)),
  }));
}
