import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt, encrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const consultation = await prisma.consultation.findFirst({
    where: { id },
    include: {
      patient: { select: { name: true, clinicId: true } },
      user: { select: { name: true } },
    },
  });

  if (!consultation || consultation.patient.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...consultation,
    complaint: tryDecrypt(consultation.complaint),
    anamnesis: tryDecrypt(consultation.anamnesis),
    physicalExam: tryDecrypt(consultation.physicalExam),
    diagnosis: tryDecrypt(consultation.diagnosis),
    prescription: tryDecrypt(consultation.prescription),
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.consultation.findFirst({
    where: { id },
    include: { patient: { select: { clinicId: true, name: true } } },
  });

  if (!existing || existing.patient.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  const consultation = await prisma.consultation.update({
    where: { id },
    data: {
      complaint: body.complaint ? encrypt(body.complaint) : existing.complaint,
      anamnesis: body.anamnesis !== undefined ? (body.anamnesis ? encrypt(body.anamnesis) : null) : existing.anamnesis,
      physicalExam: body.physicalExam !== undefined ? (body.physicalExam ? encrypt(body.physicalExam) : null) : existing.physicalExam,
      diagnosis: body.diagnosis !== undefined ? (body.diagnosis ? encrypt(body.diagnosis) : null) : existing.diagnosis,
      repertorialSymptoms: body.repertorialSymptoms !== undefined ? body.repertorialSymptoms : existing.repertorialSymptoms,
      prescription: body.prescription !== undefined ? (body.prescription ? encrypt(body.prescription) : null) : existing.prescription,
      evolution: body.evolution !== undefined ? body.evolution : existing.evolution,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.CONSULTATION_EDIT,
    details: `Consulta editada para paciente: ${existing.patient.name}`,
  });

  return NextResponse.json(consultation);
}
