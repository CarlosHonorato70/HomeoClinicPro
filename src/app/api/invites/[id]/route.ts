import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

// DELETE /api/invites/[id] — cancel an invite
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.clinicId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requirePermission(session, "manage_users");

    const { id } = await params;

    const invite = await prisma.clinicInvite.findUnique({
      where: { id },
    });

    if (!invite || invite.clinicId !== session.user.clinicId) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    await prisma.clinicInvite.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Convite cancelado" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao cancelar convite";
    const status = message.includes("Permissão negada") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
