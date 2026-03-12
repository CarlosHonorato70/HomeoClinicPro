import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

// GET /api/settings/team/members — list clinic members
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requirePermission(session, "manage_users");

    const members = await prisma.user.findMany({
      where: { clinicId: session.user.clinicId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao listar membros";
    const status = message.includes("Permissão negada") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
