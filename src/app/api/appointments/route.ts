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
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userId = searchParams.get("userId");
  const type = searchParams.get("type");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { clinicId: session.user.clinicId };

  if (from && to) {
    where.date = { gte: new Date(`${from}T00:00:00`), lte: new Date(`${to}T23:59:59`) };
  } else if (date) {
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);
    where.date = { gte: dayStart, lte: dayEnd };
  }
  if (userId) where.userId = userId;
  if (type) where.type = type;

  if (!date && !from && !type) {
    return NextResponse.json({ error: "Query param 'date', 'from'+'to', or 'type' is required" }, { status: 400 });
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, name: true, phone: true } },
    },
    orderBy: [{ date: "desc" }, { time: "asc" }],
    take: type && !date ? 50 : undefined,
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

  // Generate Jitsi meeting URL for teleconsulta type
  const isTeleconsulta = data.type === "teleconsulta";
  const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const meetingRoomId = isTeleconsulta
    ? `homeoclinic-${session.user.clinicId.slice(-6)}-${tempId}`
    : null;
  const meetingUrl = meetingRoomId
    ? `https://meet.jit.si/${meetingRoomId}`
    : null;

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
      meetingUrl,
      meetingRoomId,
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

  // Decrypt patient phone in response
  const decrypted = {
    ...appointment,
    patient: appointment.patient
      ? { ...appointment.patient, phone: tryDecrypt(appointment.patient.phone) }
      : null,
  };

  return NextResponse.json(decrypted, { status: 201 });
}
