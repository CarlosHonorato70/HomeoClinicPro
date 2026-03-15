import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { sendInviteEmail } from "@/lib/email";
import { checkUserLimit } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// GET /api/invites — list pending invites for clinic
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requirePermission(session, "manage_users");

    const invites = await prisma.clinicInvite.findMany({
      where: {
        clinicId: session.user.clinicId,
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao listar convites";
    const status = message.includes("Permissão negada") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/invites — create invite
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requirePermission(session, "manage_users");

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email e perfil são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["admin", "doctor"].includes(role)) {
      return NextResponse.json(
        { error: "Perfil inválido. Use: admin ou doctor" },
        { status: 400 }
      );
    }

    // Check if user already exists in clinic
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        clinicId: session.user.clinicId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado na clínica" },
        { status: 409 }
      );
    }

    // Check for pending invite
    const existingInvite = await prisma.clinicInvite.findFirst({
      where: {
        email,
        clinicId: session.user.clinicId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Já existe um convite pendente para este email" },
        { status: 409 }
      );
    }

    // Check clinic user limit (uses plan-based limits)
    try {
      await checkUserLimit(session.user.clinicId);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Limite de usuários atingido" },
        { status: 403 }
      );
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.clinicInvite.create({
      data: {
        clinicId: session.user.clinicId,
        email,
        role,
        expiresAt,
      },
    });

    // Send invite email (non-blocking)
    if (clinic) {
      sendInviteEmail(
        email,
        clinic.name,
        session.user.name || "Administrador",
        invite.token,
        role
      ).catch((err) => console.error("Failed to send invite email:", err));
    }

    return NextResponse.json(invite, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar convite";
    const status = message.includes("Permissão negada") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
