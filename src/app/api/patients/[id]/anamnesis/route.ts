import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anamnesisSchema } from "@/lib/validations";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decryptAnamnesis(anamnesis: any) {
  if (!anamnesis) return null;
  return {
    ...anamnesis,
    mental: tryDecrypt(anamnesis.mental),
    general: tryDecrypt(anamnesis.general),
    desires: tryDecrypt(anamnesis.desires),
    sleep: tryDecrypt(anamnesis.sleep),
    perspiration: tryDecrypt(anamnesis.perspiration),
    thermoregulation: tryDecrypt(anamnesis.thermoregulation),
    gyneco: tryDecrypt(anamnesis.gyneco),
    particular: tryDecrypt(anamnesis.particular),
  };
}

function encryptField(value: string | undefined | null): string | null {
  return value ? encrypt(value) : null;
}

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

  return NextResponse.json(decryptAnamnesis(patient.anamnesis));
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

  const encryptedData = {
    mental: encryptField(data.mental),
    general: encryptField(data.general),
    desires: encryptField(data.desires),
    sleep: encryptField(data.sleep),
    perspiration: encryptField(data.perspiration),
    thermoregulation: encryptField(data.thermoregulation),
    gyneco: encryptField(data.gyneco),
    particular: encryptField(data.particular),
  };

  const anamnesis = await prisma.anamnesis.upsert({
    where: { patientId: id },
    create: {
      patientId: id,
      ...encryptedData,
    },
    update: encryptedData,
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.ANAMNESIS_SAVE,
    details: `Anamnese salva para paciente: ${patient.name}`,
  });

  return NextResponse.json(decryptAnamnesis(anamnesis));
}
