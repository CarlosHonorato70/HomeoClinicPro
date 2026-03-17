import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/validations";

export const dynamic = "force-dynamic";

// POST /api/invites/accept — accept an invite (public, no session needed)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: "Token, nome e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const invite = await prisma.clinicInvite.findUnique({
      where: { token },
      include: { clinic: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    if (invite.usedAt) {
      return NextResponse.json(
        { error: "Este convite já foi utilizado" },
        { status: 410 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 410 }
      );
    }

    // Check if user already exists in this clinic
    const existingUser = await prisma.user.findFirst({
      where: {
        email: invite.email,
        clinicId: invite.clinicId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado na clínica" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and mark invite as used in a transaction
    await prisma.$transaction([
      prisma.user.create({
        data: {
          clinicId: invite.clinicId,
          name,
          email: invite.email,
          passwordHash,
          role: invite.role,
          emailVerified: true,
        },
      }),
      prisma.clinicInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json(
      { message: "Conta criada com sucesso. Faça login para continuar." },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao aceitar convite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
