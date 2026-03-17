import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  summary: z.string().min(1).optional(),
  symptoms: z.string().min(1).optional(),
  rubrics: z.string().optional(),
  repertorization: z.string().optional(),
  prescribedRemedy: z.string().max(200).optional(),
  potency: z.string().max(50).optional(),
  outcome: z.string().optional(),
  outcomeRating: z.number().int().min(1).max(5).optional(),
  tags: z.string().max(500).optional(),
  patientAge: z.number().int().min(0).max(150).optional(),
  patientSex: z.enum(["M", "F"]).optional(),
});

function decryptCase(c: any) {
  return {
    ...c,
    summary: tryDecrypt(c.summary),
    symptoms: tryDecrypt(c.symptoms),
    outcome: c.outcome ? tryDecrypt(c.outcome) : null,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const clinicalCase = await prisma.clinicalCase.findFirst({
    where: { id, clinicId: session.user.clinicId },
    include: { createdBy: { select: { name: true } } },
  });

  if (!clinicalCase) {
    return NextResponse.json({ error: "Caso nao encontrado" }, { status: 404 });
  }

  return NextResponse.json(decryptCase(clinicalCase));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.clinicalCase.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Caso nao encontrado" }, { status: 404 });
  }

  const data = parsed.data;
  const updated = await prisma.clinicalCase.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.summary !== undefined ? { summary: encrypt(data.summary) } : {}),
      ...(data.symptoms !== undefined ? { symptoms: encrypt(data.symptoms) } : {}),
      ...(data.rubrics !== undefined ? { rubrics: data.rubrics } : {}),
      ...(data.repertorization !== undefined ? { repertorization: data.repertorization } : {}),
      ...(data.prescribedRemedy !== undefined ? { prescribedRemedy: data.prescribedRemedy } : {}),
      ...(data.potency !== undefined ? { potency: data.potency } : {}),
      ...(data.outcome !== undefined ? { outcome: data.outcome ? encrypt(data.outcome) : null } : {}),
      ...(data.outcomeRating !== undefined ? { outcomeRating: data.outcomeRating } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.patientAge !== undefined ? { patientAge: data.patientAge } : {}),
      ...(data.patientSex !== undefined ? { patientSex: data.patientSex } : {}),
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.CONSULTATION_EDIT,
    details: `Caso clinico editado: ${updated.title}`,
  });

  return NextResponse.json(decryptCase(updated));
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin can delete
  try {
    requirePermission(session, "manage_settings");
  } catch {
    return NextResponse.json({ error: "Sem permissao para excluir" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.clinicalCase.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Caso nao encontrado" }, { status: 404 });
  }

  await prisma.clinicalCase.delete({ where: { id } });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.CONSULTATION_EDIT,
    details: `Caso clinico excluido: ${existing.title}`,
  });

  return NextResponse.json({ success: true });
}
