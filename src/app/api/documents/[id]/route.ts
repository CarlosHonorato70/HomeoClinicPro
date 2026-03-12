import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id },
    include: {
      patient: { select: { name: true, cpf: true, clinicId: true } },
    },
  });

  if (!document || document.patient.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.DOCUMENT_VIEW,
    details: `Documento "${document.title}" visualizado`,
  });

  return NextResponse.json({
    ...document,
    content: tryDecrypt(document.content),
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id },
    include: {
      patient: { select: { name: true, clinicId: true } },
    },
  });

  if (!document || document.patient.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id } });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.DOCUMENT_DELETE,
    details: `Documento "${document.title}" (${document.type}) excluído — paciente: ${document.patient.name}`,
  });

  return NextResponse.json({ success: true });
}
