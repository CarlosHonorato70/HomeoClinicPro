import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/superadmin";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requireSuperAdmin(session);

    const [clinicCount, userCount, patientCount, clinics] = await Promise.all([
      prisma.clinic.count(),
      prisma.user.count(),
      prisma.patient.count(),
      prisma.clinic.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionStatus: true,
          stripePriceId: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
          maxPatients: true,
          maxUsersPerClinic: true,
          createdAt: true,
          _count: { select: { users: true, patients: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const now = new Date();

    const clinicDetails = clinics.map((c) => {
      const plan = getPlanFromPriceId(c.stripePriceId);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        plan: plan.name,
        planKey: plan.key,
        status: c.subscriptionStatus,
        usersCount: c._count.users,
        patientsCount: c._count.patients,
        maxUsers: c.maxUsersPerClinic ?? plan.maxUsers,
        maxPatients: c.maxPatients ?? plan.maxPatients,
        trialEndsAt: c.trialEndsAt,
        currentPeriodEnd: c.currentPeriodEnd,
        createdAt: c.createdAt,
      };
    });

    // Generate alerts
    const alerts: { clinicId: string; clinicName: string; type: string; message: string }[] = [];

    for (const c of clinicDetails) {
      // Expired trial still marked as trialing
      if (c.status === "trialing" && c.trialEndsAt && new Date(c.trialEndsAt) < now) {
        alerts.push({
          clinicId: c.id,
          clinicName: c.name,
          type: "expired_trial",
          message: `Trial expirado mas status ainda é "trialing"`,
        });
      }

      // Users exceeding plan limit
      if (c.maxUsers !== -1 && c.usersCount > c.maxUsers) {
        alerts.push({
          clinicId: c.id,
          clinicName: c.name,
          type: "users_exceeded",
          message: `${c.usersCount} usuários (limite: ${c.maxUsers})`,
        });
      }

      // High user count (potential resale)
      if (c.usersCount >= 8) {
        alerts.push({
          clinicId: c.id,
          clinicName: c.name,
          type: "high_users",
          message: `${c.usersCount} usuários ativos — verificar possível revenda`,
        });
      }
    }

    const overview = {
      totalClinics: clinicCount,
      totalUsers: userCount,
      totalPatients: patientCount,
      activeSubscriptions: clinics.filter((c) => c.subscriptionStatus === "active").length,
      trialingClinics: clinics.filter((c) => c.subscriptionStatus === "trialing").length,
      canceledClinics: clinics.filter((c) => c.subscriptionStatus === "canceled").length,
    };

    return NextResponse.json({ overview, clinics: clinicDetails, alerts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("superadmin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
