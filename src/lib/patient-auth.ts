/**
 * Patient portal authentication.
 * Separate from clinic auth — patients cannot access clinic routes.
 * Uses custom JWT tokens.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";
const TOKEN_EXPIRY_HOURS = 24;

interface PatientTokenPayload {
  patientAccessId: string;
  patientId: string;
  email: string;
  exp: number;
}

/**
 * Create a simple HMAC-based token for patient portal.
 * Not a full JWT — simpler and sufficient for this use case.
 */
export function createPatientToken(payload: Omit<PatientTokenPayload, "exp">): string {
  const data: PatientTokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a patient portal token.
 */
export function verifyPatientToken(token: string): PatientTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(encoded)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as PatientTokenPayload;

  if (payload.exp < Date.now()) return null;

  return payload;
}

/**
 * Authenticate patient and return token.
 */
export async function authenticatePatient(
  email: string,
  password: string
): Promise<{ token: string; patientId: string } | null> {
  const access = await prisma.patientAccess.findFirst({
    where: { email: email.toLowerCase().trim(), active: true },
  });

  if (!access) return null;

  const valid = await bcrypt.compare(password, access.passwordHash);
  if (!valid) return null;

  // Update last login
  await prisma.patientAccess.update({
    where: { id: access.id },
    data: { lastLogin: new Date() },
  });

  const token = createPatientToken({
    patientAccessId: access.id,
    patientId: access.patientId,
    email: access.email,
  });

  return { token, patientId: access.patientId };
}

/**
 * Create portal access for a patient.
 */
export async function createPatientAccess(
  patientId: string,
  email: string,
  password: string
): Promise<{ id: string }> {
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.patientAccess.create({
    data: {
      patientId,
      email: email.toLowerCase().trim(),
      passwordHash,
    },
  });
}
