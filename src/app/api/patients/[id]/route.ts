import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: session.user.clinicId },
    include: {
      consultations: {
        orderBy: { date: "desc" },
        include: { user: { select: { name: true } } },
      },
      anamnesis: true,
      _count: { select: { consultations: true } },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...patient,
    cpf: tryDecrypt(patient.cpf),
    phone: tryDecrypt(patient.phone),
    email: tryDecrypt(patient.email),
    consultations: patient.consultations.map((c) => ({
      ...c,
      complaint: tryDecrypt(c.complaint),
      anamnesis: tryDecrypt(c.anamnesis),
      physicalExam: tryDecrypt(c.physicalExam),
      diagnosis: tryDecrypt(c.diagnosis),
      prescription: tryDecrypt(c.prescription),
    })),
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
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.patient.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const data = parsed.data;

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      name: data.name,
      cpf: data.cpf ? encrypt(data.cpf) : null,
      rg: data.rg || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      sex: data.sex || null,
      phone: data.phone ? encrypt(data.phone) : null,
      email: data.email ? encrypt(data.email) : null,
      address: data.address || null,
      profession: data.profession || null,
      insurance: data.insurance || null,
      notes: data.notes || null,
      lgpdConsent: data.lgpdConsent,
      lgpdConsentDate: data.lgpdConsent && !existing.lgpdConsent ? new Date() : existing.lgpdConsentDate,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_EDIT,
    details: `Paciente editado: ${data.name}`,
  });

  return NextResponse.json(patient);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.patient.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  await prisma.patient.delete({ where: { id } });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_DELETE,
    details: `Paciente excluído: ${existing.name}`,
  });

  return NextResponse.json({ success: true });
}
