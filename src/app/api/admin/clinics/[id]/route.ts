import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/superadmin";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId, PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

// GET /api/admin/clinics/[id] — clinic detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    requireSuperAdmin(session);

    const { id } = await params;

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { patients: true, auditLogs: true },
        },
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });
    }

    const plan = getPlanFromPriceId(clinic.stripePriceId);

    return NextResponse.json({
      ...clinic,
      plan: plan.name,
      planKey: plan.key,
      planLimits: {
        maxPatients: plan.maxPatients,
        maxUsers: plan.maxUsers,
        maxConsultationsPerMonth: plan.maxConsultationsPerMonth,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("superadmin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/admin/clinics/[id] — update clinic settings
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    requireSuperAdmin(session);

    const { id } = await params;
    const body = await req.json();
    const {
      maxPatients,
      maxUsersPerClinic,
      subscriptionStatus,
      trialEndsAt,
      currentPeriodEnd,
      planKey,
      applyPlanDefaults,
    } = body;

    const data: Record<string, unknown> = {};

    // Limits
    if (maxPatients !== undefined) data.maxPatients = Number(maxPatients);
    if (maxUsersPerClinic !== undefined) data.maxUsersPerClinic = Number(maxUsersPerClinic);
    if (subscriptionStatus !== undefined) data.subscriptionStatus = String(subscriptionStatus);

    // Trial / period dates
    if (trialEndsAt !== undefined) {
      data.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
    }
    if (currentPeriodEnd !== undefined) {
      data.currentPeriodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
    }

    // Plan change
    if (planKey !== undefined) {
      const plan = PLANS[planKey as keyof typeof PLANS];
      if (!plan) {
        return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
      }
      data.stripePriceId = plan.priceId;
      if (applyPlanDefaults) {
        data.maxPatients = plan.maxPatients;
        data.maxUsersPerClinic = plan.maxUsers;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    const updated = await prisma.clinic.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("superadmin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/admin/clinics/[id] — delete clinic and all related data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    requireSuperAdmin(session);

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    if (!body.confirm) {
      return NextResponse.json(
        { error: "Confirmação necessária: envie { confirm: true }" },
        { status: 400 }
      );
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id },
      select: {
        name: true,
        _count: { select: { users: true, patients: true, auditLogs: true } },
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });
    }

    // Log before deletion (audit logs are deleted with the clinic)
    console.warn(
      `[SUPERADMIN] Excluindo clínica "${clinic.name}" (${id}) — ` +
      `${clinic._count.users} usuários, ${clinic._count.patients} pacientes, ` +
      `${clinic._count.auditLogs} logs. Executado por: ${session.user.email}`
    );

    // Get patient IDs and user IDs for cascading
    const patientIds = (
      await prisma.patient.findMany({ where: { clinicId: id }, select: { id: true } })
    ).map((p) => p.id);

    const userIds = (
      await prisma.user.findMany({ where: { clinicId: id }, select: { id: true } })
    ).map((u) => u.id);

    await prisma.$transaction([
      // Delete patient-related records
      prisma.lgpdConsent.deleteMany({ where: { patientId: { in: patientIds } } }),
      prisma.consultation.deleteMany({ where: { patientId: { in: patientIds } } }),
      prisma.anamnesis.deleteMany({ where: { patientId: { in: patientIds } } }),
      prisma.document.deleteMany({ where: { clinicId: id } }),
      prisma.appointment.deleteMany({ where: { clinicId: id } }),
      prisma.financial.deleteMany({ where: { clinicId: id } }),
      prisma.patient.deleteMany({ where: { clinicId: id } }),
      // Delete user-related records
      prisma.passwordReset.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.auditLog.deleteMany({ where: { clinicId: id } }),
      prisma.clinicInvite.deleteMany({ where: { clinicId: id } }),
      prisma.user.deleteMany({ where: { clinicId: id } }),
      // Delete clinic
      prisma.clinic.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: `Clínica "${clinic.name}" excluída com sucesso.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("superadmin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
