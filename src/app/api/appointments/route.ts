import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const userId = searchParams.get("userId");

  if (!date) {
    return NextResponse.json({ error: "Query param 'date' is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: session.user.clinicId,
      date: { gte: dayStart, lte: dayEnd },
      ...(userId ? { userId } : {}),
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { time: "asc" },
  });

  // Decrypt patient phone in response
  const decrypted = appointments.map((a: typeof appointments[0]) => ({
    ...a,
    patient: a.patient
      ? { ...a.patient, phone: tryDecrypt(a.patient.phone) }
      : null,
  }));

  return NextResponse.json(decrypted);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const appointment = await prisma.appointment.create({
    data: {
      clinicId: session.user.clinicId,
      userId: session.user.id,
      patientId: data.patientId || null,
      date: new Date(data.date),
      time: data.time,
      duration: data.duration,
      type: data.type,
      notes: data.notes || null,
      status: "scheduled",
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.APPOINTMENT_NEW,
    details: `Agendamento criado: ${data.date} ${data.time}`,
  });

  return NextResponse.json(appointment, { status: 201 });
}
