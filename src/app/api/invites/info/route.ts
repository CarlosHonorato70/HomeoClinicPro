import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/invites/info?token=xxx — get invite info (public, no session needed)
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      );
    }

    const invite = await prisma.clinicInvite.findUnique({
      where: { token },
      include: { clinic: { select: { name: true } } },
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

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      clinicName: invite.clinic.name,
      expiresAt: invite.expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao buscar informações do convite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
