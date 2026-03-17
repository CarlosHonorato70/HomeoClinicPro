import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/superadmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/admin/users/[id] — toggle active status
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
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Campo 'active' (boolean) obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, clinicId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, name: true, active: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("superadmin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/admin/users/[id] — delete a user
export async function DELETE(
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, clinicId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Prevent deleting the last admin of a clinic
    if (user.role === "admin") {
      const adminCount = await prisma.user.count({
        where: { clinicId: user.clinicId, role: "admin" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Não é possível excluir o último administrador da clínica" },
          { status: 400 }
        );
      }
    }

    console.warn(
      `[SUPERADMIN] Excluindo usuário "${user.name}" (${user.email}) da clínica ${user.clinicId}. ` +
      `Executado por: ${session.user.email}`
    );

    // Check if user has consultations — if so, only allow deactivation
    const consultationCount = await prisma.consultation.count({ where: { userId: id } });
    if (consultationCount > 0) {
      return NextResponse.json(
        {
          error: `Usuário possui ${consultationCount} consulta(s) registrada(s). ` +
            `Desative o usuário em vez de excluí-lo para preservar os prontuários.`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { userId: id } }),
      prisma.auditLog.updateMany({ where: { userId: id }, data: { userId: null } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: `Usuário "${user.name}" excluído com sucesso.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("superadmin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
