import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClinicLimits } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clinic = await prisma.clinic.findUniqueOrThrow({
      where: { id: session.user.clinicId },
      select: {
        subscriptionStatus: true,
        stripePriceId: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        maxPatients: true,
        maxUsersPerClinic: true,
      },
    });

    const limits = getClinicLimits(clinic);

    // Count current patients
    const patientCount = await prisma.patient.count({
      where: { clinicId: session.user.clinicId },
    });

    // Count consultations this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const consultationCount = await prisma.consultation.count({
      where: {
        patient: { clinicId: session.user.clinicId },
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    return NextResponse.json({
      subscriptionStatus: clinic.subscriptionStatus,
      currentPeriodEnd: clinic.currentPeriodEnd,
      trialEndsAt: clinic.trialEndsAt,
      hasStripeCustomer: !!clinic.stripeCustomerId,
      hasSubscription: !!clinic.stripeSubscriptionId,
      plan: {
        key: limits.plan.key,
        name: limits.plan.name,
      },
      usage: {
        patients: patientCount,
        consultationsThisMonth: consultationCount,
      },
      limits: {
        maxPatients: limits.maxPatients,
        maxUsers: limits.maxUsers,
        maxConsultationsPerMonth: limits.maxConsultationsPerMonth,
      },
    });
  } catch (err) {
    console.error("Error fetching billing status:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao buscar status da assinatura";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
