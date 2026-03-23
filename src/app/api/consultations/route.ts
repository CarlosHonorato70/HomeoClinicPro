import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consultationSchema } from "@/lib/validations";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";
import { checkConsultationLimit } from "@/lib/subscription";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = consultationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId: session.user.clinicId },
  });
  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  // LGPD: verify patient consent before processing health data
  if (!patient.lgpdConsent) {
    return NextResponse.json(
      { error: "Paciente não possui consentimento LGPD ativo. Obtenha o consentimento antes de registrar dados clínicos." },
      { status: 403 }
    );
  }

  try {
    await checkConsultationLimit(session.user.clinicId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Limite de consultas atingido";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const consultation = await prisma.consultation.create({
    data: {
      patientId: data.patientId,
      userId: session.user.id,
      date: new Date(data.date),
      complaint: encrypt(data.complaint),
      anamnesis: data.anamnesis ? encrypt(data.anamnesis) : null,
      physicalExam: data.physicalExam ? encrypt(data.physicalExam) : null,
      diagnosis: data.diagnosis ? encrypt(data.diagnosis) : null,
      repertorialSymptoms: data.repertorialSymptoms ? encrypt(data.repertorialSymptoms) : null,
      prescription: data.prescription ? encrypt(data.prescription) : null,
      evolution: data.evolution ? encrypt(data.evolution) : null,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.CONSULTATION_NEW,
    details: `Consulta criada para paciente: ${patient.name}`,
  });

  // Decrypt fields before returning to client
  const decrypted = {
    ...consultation,
    complaint: tryDecrypt(consultation.complaint),
    anamnesis: tryDecrypt(consultation.anamnesis),
    physicalExam: tryDecrypt(consultation.physicalExam),
    diagnosis: tryDecrypt(consultation.diagnosis),
    repertorialSymptoms: tryDecrypt(consultation.repertorialSymptoms),
    prescription: tryDecrypt(consultation.prescription),
    evolution: tryDecrypt(consultation.evolution),
  };

  return NextResponse.json(decrypted, { status: 201 });
}
