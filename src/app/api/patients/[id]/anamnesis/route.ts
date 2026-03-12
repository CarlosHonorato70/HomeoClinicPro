import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anamnesisSchema } from "@/lib/validations";
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
    include: { anamnesis: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  return NextResponse.json(patient.anamnesis);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = anamnesisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const data = parsed.data;

  const anamnesis = await prisma.anamnesis.upsert({
    where: { patientId: id },
    create: {
      patientId: id,
      ...data,
    },
    update: data,
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.ANAMNESIS_SAVE,
    details: `Anamnese salva para paciente: ${patient.name}`,
  });

  return NextResponse.json(anamnesis);
}
