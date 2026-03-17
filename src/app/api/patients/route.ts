import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";
import { checkPatientLimit } from "@/lib/subscription";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: session.user.clinicId,
      deletedAt: null,
      ...(search ? { name: { contains: search } } : {}),
    },
    include: { _count: { select: { consultations: true } } },
    orderBy: { name: "asc" },
  });

  const decrypted = patients.map((p) => ({
    ...p,
    cpf: tryDecrypt(p.cpf),
    rg: tryDecrypt(p.rg),
    phone: tryDecrypt(p.phone),
    email: tryDecrypt(p.email),
    address: tryDecrypt(p.address),
    profession: tryDecrypt(p.profession),
    insurance: tryDecrypt(p.insurance),
    notes: tryDecrypt(p.notes),
  }));

  return NextResponse.json(decrypted);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    await checkPatientLimit(session.user.clinicId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Limite de pacientes atingido";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const patient = await prisma.patient.create({
    data: {
      clinicId: session.user.clinicId,
      name: data.name,
      cpf: data.cpf ? encrypt(data.cpf) : null,
      rg: data.rg ? encrypt(data.rg) : null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      sex: data.sex || null,
      phone: data.phone ? encrypt(data.phone) : null,
      email: data.email ? encrypt(data.email) : null,
      address: data.address ? encrypt(data.address) : null,
      profession: data.profession ? encrypt(data.profession) : null,
      insurance: data.insurance ? encrypt(data.insurance) : null,
      notes: data.notes ? encrypt(data.notes) : null,
      lgpdConsent: data.lgpdConsent,
      lgpdConsentDate: data.lgpdConsent ? new Date() : null,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_NEW,
    details: `Paciente cadastrado: ${data.name}`,
  });

  return NextResponse.json(patient, { status: 201 });
}
