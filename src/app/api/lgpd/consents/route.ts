import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lgpdConsentSchema } from "@/lib/validations";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  // Verify patient belongs to the clinic
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.user.clinicId },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const consents = await prisma.lgpdConsent.findMany({
    where: { patientId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(consents);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = lgpdConsentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { patientId, consentType, granted } = parsed.data;

  // Verify patient belongs to the clinic
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.user.clinicId },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const consent = await prisma.lgpdConsent.create({
    data: {
      patientId,
      consentType,
      granted,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.LGPD_CONSENT,
    details: `Consentimento ${consentType} ${granted ? "concedido" : "negado"} para paciente ${patient.name}`,
  });

  return NextResponse.json(consent, { status: 201 });
}
