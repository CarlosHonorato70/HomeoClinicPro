import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/superadmin";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId } from "@/lib/plans";

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

// PATCH /api/admin/clinics/[id] — update clinic limits
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
    const { maxPatients, maxUsersPerClinic, subscriptionStatus } = body;

    const data: Record<string, unknown> = {};
    if (maxPatients !== undefined) data.maxPatients = Number(maxPatients);
    if (maxUsersPerClinic !== undefined) data.maxUsersPerClinic = Number(maxUsersPerClinic);
    if (subscriptionStatus !== undefined) data.subscriptionStatus = String(subscriptionStatus);

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
