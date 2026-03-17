import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinicId = session.user.clinicId;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalPatients,
    consultationsThisMonth,
    appointmentsToday,
    consultationsToday,
    recentConsultations,
    recentPatients,
    todayAppointments,
    patientsWithMultipleConsultations,
  ] = await Promise.all([
    // Total patients (not soft-deleted)
    prisma.patient.count({
      where: { clinicId, deletedAt: null },
    }),

    // Consultations this month
    prisma.consultation.count({
      where: {
        patient: { clinicId },
        date: { gte: monthStart },
      },
    }),

    // Appointments today
    prisma.appointment.count({
      where: {
        clinicId,
        date: { gte: todayStart, lt: todayEnd },
      },
    }),

    // Consultations today
    prisma.consultation.count({
      where: {
        patient: { clinicId },
        date: { gte: todayStart, lt: todayEnd },
      },
    }),

    // Consultations per month (last 6 months)
    prisma.consultation.findMany({
      where: {
        patient: { clinicId },
        date: { gte: sixMonthsAgo },
      },
      select: { date: true },
    }),

    // Patients created per month (last 6 months)
    prisma.patient.findMany({
      where: {
        clinicId,
        deletedAt: null,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    }),

    // Today's appointments with details
    prisma.appointment.findMany({
      where: {
        clinicId,
        date: { gte: todayStart, lt: todayEnd },
      },
      include: {
        patient: { select: { name: true } },
      },
      orderBy: { time: "asc" },
      take: 10,
    }),

    // Patients with more than 1 consultation (return rate)
    prisma.patient.count({
      where: {
        clinicId,
        deletedAt: null,
        consultations: { some: {} },
      },
    }),
  ]);

  // Group consultations by month
  const consultationsByMonth = groupByMonth(
    recentConsultations.map((c) => c.date),
    6
  );

  // Group new patients by month
  const patientsByMonth = groupByMonth(
    recentPatients.map((p) => p.createdAt),
    6
  );

  // Return rate
  const returnRate = totalPatients > 0
    ? Math.round((patientsWithMultipleConsultations / totalPatients) * 100)
    : 0;

  return NextResponse.json({
    cards: {
      totalPatients,
      consultationsThisMonth,
      appointmentsToday,
      consultationsToday,
      returnRate,
    },
    consultationsByMonth,
    patientsByMonth,
    todayAppointments: todayAppointments.map((a) => ({
      id: a.id,
      time: a.time,
      patientName: a.patient?.name || "Sem paciente",
      type: a.type,
      status: a.status,
    })),
  });
}

function groupByMonth(dates: Date[], months: number) {
  const now = new Date();
  const result: { month: string; count: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    result.push({ month: label, count: 0 });
  }

  for (const date of dates) {
    const d = new Date(date);
    const monthsDiff =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsDiff >= 0 && monthsDiff < months) {
      const idx = months - 1 - monthsDiff;
      result[idx].count++;
    }
  }

  return result;
}
