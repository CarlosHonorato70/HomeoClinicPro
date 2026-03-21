import { vi } from "vitest";

// Mock Prisma client for unit tests
// Usage: import { prismaMock } from "@/tests/helpers/mock-prisma"

export const prismaMock = {
  clinic: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  patient: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  consultation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  rubric: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  chapter: {
    findMany: vi.fn(),
  },
  remedy: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  lgpdConsent: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  document: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  appointment: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  financial: {
    findMany: vi.fn(),
    create: vi.fn(),
    aggregate: vi.fn(),
  },
  clinicInvite: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(prismaMock)),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
