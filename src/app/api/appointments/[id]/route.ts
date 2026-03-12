import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId: session.user.clinicId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(appointment);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(body.patientId !== undefined ? { patientId: body.patientId || null } : {}),
      ...(body.date ? { date: new Date(body.date) } : {}),
      ...(body.time ? { time: body.time } : {}),
      ...(body.duration ? { duration: body.duration } : {}),
      ...(body.type ? { type: body.type } : {}),
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
      ...(body.status ? { status: body.status } : {}),
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
    },
  });

  const isCancellation = body.status === "cancelled";
  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: isCancellation ? AuditActions.APPOINTMENT_CANCEL : AuditActions.APPOINTMENT_EDIT,
    details: isCancellation
      ? `Agendamento cancelado: ${existing.date.toISOString().split("T")[0]} ${existing.time}`
      : `Agendamento editado: ${appointment.date.toISOString().split("T")[0]} ${appointment.time}`,
  });

  return NextResponse.json(appointment);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId: session.user.clinicId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id } });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.APPOINTMENT_CANCEL,
    details: `Agendamento excluído: ${existing.date.toISOString().split("T")[0]} ${existing.time}`,
  });

  return NextResponse.json({ success: true });
}
