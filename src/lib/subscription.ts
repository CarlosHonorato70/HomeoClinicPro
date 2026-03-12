import { prisma } from "@/lib/prisma";
import { getClinicLimits } from "@/lib/plans";

/**
 * Checks whether the clinic has reached its patient limit.
 * Throws an error with a descriptive message if the limit is exceeded.
 */
export async function checkPatientLimit(clinicId: string): Promise<void> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: { stripePriceId: true, maxPatients: true, maxUsersPerClinic: true },
  });

  const limits = getClinicLimits(clinic);

  // -1 means unlimited
  if (limits.maxPatients === -1) return;

  const patientCount = await prisma.patient.count({
    where: { clinicId },
  });

  if (patientCount >= limits.maxPatients) {
    throw new Error(
      `Limite de pacientes atingido (${patientCount}/${limits.maxPatients}). ` +
        `Faça upgrade do seu plano para cadastrar mais pacientes.`
    );
  }
}

/**
 * Checks whether the clinic has reached its monthly consultation limit.
 * Throws an error if the limit is exceeded.
 */
export async function checkConsultationLimit(clinicId: string): Promise<void> {
  const clinic = await prisma.clinic.findUniqueOrThrow({
    where: { id: clinicId },
    select: { stripePriceId: true, maxPatients: true, maxUsersPerClinic: true },
  });

  const limits = getClinicLimits(clinic);

  // -1 means unlimited
  if (limits.maxConsultationsPerMonth === -1) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const consultationCount = await prisma.consultation.count({
    where: {
      patient: { clinicId },
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
  });

  if (consultationCount >= limits.maxConsultationsPerMonth) {
    throw new Error(
      `Limite de consultas mensais atingido (${consultationCount}/${limits.maxConsultationsPerMonth}). ` +
        `Faça upgrade do seu plano para realizar mais consultas.`
    );
  }
}

/**
 * Throws if the subscription status is not active or trialing.
 */
export function requireActiveSubscription(subscriptionStatus: string): void {
  const allowed = ["active", "trialing"];

  if (!allowed.includes(subscriptionStatus)) {
    throw new Error(
      `Assinatura inativa (status: ${subscriptionStatus}). ` +
        `Por favor, atualize sua assinatura para continuar usando o sistema.`
    );
  }
}
