import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

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
    recentPrescriptions,
    allAppointments6m,
    recentFinancials,
    consultationsByDoctor,
    totalClinicalCases,
    outcomeRatings,
    activePatients,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.patient.count({
      where: { clinicId, deletedAt: null },
    }),
    prisma.consultation.count({
      where: { patient: { clinicId }, date: { gte: monthStart } },
    }),
    prisma.appointment.count({
      where: { clinicId, date: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.consultation.count({
      where: { patient: { clinicId }, date: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.consultation.findMany({
      where: { patient: { clinicId }, date: { gte: sixMonthsAgo } },
      select: { date: true },
    }),
    prisma.patient.findMany({
      where: { clinicId, deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.appointment.findMany({
      where: { clinicId, date: { gte: todayStart, lt: todayEnd } },
      include: { patient: { select: { name: true } } },
      orderBy: { time: "asc" },
      take: 10,
    }),
    prisma.patient.count({
      where: { clinicId, deletedAt: null, consultations: { some: {} } },
    }),
    // Prescriptions for top remedies
    prisma.consultation.findMany({
      where: { patient: { clinicId }, prescription: { not: null } },
      select: { prescription: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    }),
    // All appointments last 6 months for completion rate
    prisma.appointment.findMany({
      where: { clinicId, date: { gte: sixMonthsAgo } },
      select: { status: true },
    }),
    // Revenue by month
    prisma.financial.findMany({
      where: { clinicId, date: { gte: sixMonthsAgo }, type: "income" },
      select: { date: true, amount: true },
    }),
    // Consultations by doctor
    prisma.consultation.groupBy({
      by: ["userId"],
      where: { patient: { clinicId }, date: { gte: sixMonthsAgo } },
      _count: true,
    }),
    // Clinical cases count
    prisma.clinicalCase.count({ where: { clinicId } }),
    // Outcome ratings distribution
    prisma.clinicalCase.groupBy({
      by: ["outcomeRating"],
      where: { clinicId, outcomeRating: { not: null } },
      _count: true,
    }),
    // Active patients (had consultation in last 6 months)
    prisma.patient.count({
      where: {
        clinicId,
        deletedAt: null,
        consultations: { some: { date: { gte: sixMonthsAgo } } },
      },
    }),
    // Upcoming appointments (next 7 days)
    prisma.appointment.findMany({
      where: {
        clinicId,
        date: { gte: todayStart, lte: new Date(todayStart.getTime() + 7 * 86400000) },
        status: { not: "cancelled" },
      },
      include: { patient: { select: { name: true } } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 15,
    }),
  ]);

  const consultationsByMonth = groupByMonth(recentConsultations.map((c) => c.date), 6);
  const patientsByMonth = groupByMonth(recentPatients.map((p) => p.createdAt), 6);

  const returnRate = totalPatients > 0
    ? Math.round((patientsWithMultipleConsultations / totalPatients) * 100)
    : 0;

  // Top remedies from prescriptions
  const remedyCounts: Record<string, number> = {};
  for (const p of recentPrescriptions) {
    if (!p.prescription) continue;
    const text = tryDecrypt(p.prescription) || "";
    // Extract first remedy-like word (capitalized word at beginning)
    const match = text.match(/^([A-Z][a-z]+(?:\s[a-z]+)?)/);
    if (match) {
      const name = match[1].trim();
      remedyCounts[name] = (remedyCounts[name] || 0) + 1;
    }
  }
  const topRemedies = Object.entries(remedyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Appointment completion rate
  const totalAppts = allAppointments6m.length;
  const completedAppts = allAppointments6m.filter((a) => a.status === "completed").length;
  const cancelledAppts = allAppointments6m.filter((a) => a.status === "cancelled").length;
  const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;

  // Revenue by month
  const revenueByMonth = groupByMonthAmount(recentFinancials.map((f) => ({ date: f.date, amount: f.amount })), 6);

  // Average consultations per patient
  const totalConsultations = recentConsultations.length;
  const avgConsPerPatient = totalPatients > 0
    ? Math.round((totalConsultations / totalPatients) * 10) / 10
    : 0;

  // Consultations by doctor names
  const doctorIds = consultationsByDoctor.map((d) => d.userId);
  const doctors = doctorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: doctorIds } },
        select: { id: true, name: true },
      })
    : [];
  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d.name]));
  const consByDoctor = consultationsByDoctor.map((d) => ({
    name: doctorMap[d.userId] || "Desconhecido",
    count: d._count,
  }));

  // Outcome distribution
  const ratingLabels: Record<number, string> = {
    1: "Sem melhora",
    2: "Pouca melhora",
    3: "Melhora parcial",
    4: "Boa melhora",
    5: "Cura completa",
  };
  const outcomeDistribution = outcomeRatings.map((r: { outcomeRating: number | null; _count: number }) => ({
    name: ratingLabels[r.outcomeRating ?? 0] || `Rating ${r.outcomeRating}`,
    rating: r.outcomeRating,
    count: r._count,
  }));
  const totalRated = outcomeRatings.reduce((s: number, r: { _count: number }) => s + r._count, 0);
  const goodOutcomes = outcomeRatings
    .filter((r: { outcomeRating: number | null }) => (r.outcomeRating ?? 0) >= 4)
    .reduce((s: number, r: { _count: number }) => s + r._count, 0);
  const improvementRate = totalRated > 0 ? Math.round((goodOutcomes / totalRated) * 100) : 0;

  return NextResponse.json({
    cards: {
      totalPatients,
      consultationsThisMonth,
      appointmentsToday,
      consultationsToday,
      returnRate,
      completionRate,
      avgConsPerPatient,
      totalClinicalCases,
      improvementRate,
      activePatients,
    },
    consultationsByMonth,
    patientsByMonth,
    topRemedies,
    revenueByMonth,
    consByDoctor,
    outcomeDistribution,
    upcomingAppointments: upcomingAppointments.map((a) => ({
      id: a.id,
      date: a.date,
      time: a.time,
      patientName: a.patient?.name || "Sem paciente",
      type: a.type,
      status: a.status,
    })),
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

function groupByMonthAmount(items: { date: Date; amount: number }[], months: number) {
  const now = new Date();
  const result: { month: string; amount: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    result.push({ month: label, amount: 0 });
  }

  for (const item of items) {
    const d = new Date(item.date);
    const monthsDiff =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsDiff >= 0 && monthsDiff < months) {
      const idx = months - 1 - monthsDiff;
      result[idx].amount += item.amount;
    }
  }

  return result;
}
