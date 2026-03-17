import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt, encrypt } from "@/lib/encryption";
import { consultationSchema } from "@/lib/validations";
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
    repertorialSymptoms: tryDecrypt(consultation.repertorialSymptoms),
    prescription: tryDecrypt(consultation.prescription),
    evolution: tryDecrypt(consultation.evolution),
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

  // Validate input with partial schema (all fields optional for update)
  const updateSchema = consultationSchema.partial().omit({ patientId: true, date: true });
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

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
      complaint: data.complaint ? encrypt(data.complaint) : existing.complaint,
      anamnesis: data.anamnesis !== undefined ? (data.anamnesis ? encrypt(data.anamnesis) : null) : existing.anamnesis,
      physicalExam: data.physicalExam !== undefined ? (data.physicalExam ? encrypt(data.physicalExam) : null) : existing.physicalExam,
      diagnosis: data.diagnosis !== undefined ? (data.diagnosis ? encrypt(data.diagnosis) : null) : existing.diagnosis,
      repertorialSymptoms: data.repertorialSymptoms !== undefined ? (data.repertorialSymptoms ? encrypt(data.repertorialSymptoms) : null) : existing.repertorialSymptoms,
      prescription: data.prescription !== undefined ? (data.prescription ? encrypt(data.prescription) : null) : existing.prescription,
      evolution: data.evolution !== undefined ? (data.evolution ? encrypt(data.evolution) : null) : existing.evolution,
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
