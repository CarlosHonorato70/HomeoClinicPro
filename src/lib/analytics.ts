/**
 * Analytics query builders and helpers.
 */

import { prisma } from "./prisma";

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Parse date range from query params.
 * Defaults to last 30 days.
 */
export function parseDateRange(
  startStr?: string | null,
  endStr?: string | null
): DateRange {
  const end = endStr ? new Date(endStr) : new Date();
  const start = startStr
    ? new Date(startStr)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Get clinical analytics data.
 */
export async function getClinicalAnalytics(clinicId: string, range: DateRange) {
  const [
    totalConsultations,
    totalPatients,
    consultationsByMonth,
    topRemedies,
  ] = await Promise.all([
    // Total consultations in range
    prisma.consultation.count({
      where: {
        patient: { clinicId },
        date: { gte: range.start, lte: range.end },
      },
    }),
    // Total active patients
    prisma.patient.count({
      where: { clinicId, deletedAt: null },
    }),
    // Consultations grouped by month (raw SQL for grouping)
    prisma.$queryRawUnsafe<{ month: string; count: bigint }[]>(
      `SELECT to_char(c.date, 'YYYY-MM') as month, COUNT(*) as count
       FROM "Consultation" c
       JOIN "Patient" p ON c."patientId" = p.id
       WHERE p."clinicId" = $1 AND c.date >= $2 AND c.date <= $3
       GROUP BY month ORDER BY month`,
      clinicId,
      range.start,
      range.end
    ),
    // Top prescribed remedies (from prescription field)
    prisma.consultation.findMany({
      where: {
        patient: { clinicId },
        date: { gte: range.start, lte: range.end },
        prescription: { not: null },
      },
      select: { prescription: true },
      take: 200,
    }),
  ]);

  return {
    totalConsultations,
    totalPatients,
    consultationsByMonth: consultationsByMonth.map((r) => ({
      month: r.month,
      count: Number(r.count),
    })),
    prescriptionCount: topRemedies.length,
  };
}

/**
 * Get financial analytics data.
 */
export async function getFinancialAnalytics(clinicId: string, range: DateRange) {
  const [income, expenses, revenueByMonth] = await Promise.all([
    prisma.financial.aggregate({
      where: {
        clinicId,
        type: "income",
        date: { gte: range.start, lte: range.end },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financial.aggregate({
      where: {
        clinicId,
        type: "expense",
        date: { gte: range.start, lte: range.end },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.$queryRawUnsafe<{ month: string; total: number }[]>(
      `SELECT to_char(date, 'YYYY-MM') as month, SUM(amount) as total
       FROM "Financial"
       WHERE "clinicId" = $1 AND type = 'income' AND date >= $2 AND date <= $3
       GROUP BY month ORDER BY month`,
      clinicId,
      range.start,
      range.end
    ),
  ]);

  return {
    totalIncome: income._sum.amount || 0,
    totalExpenses: expenses._sum.amount || 0,
    netProfit: (income._sum.amount || 0) - (expenses._sum.amount || 0),
    incomeCount: income._count,
    expenseCount: expenses._count,
    revenueByMonth: revenueByMonth.map((r) => ({
      month: r.month,
      total: Number(r.total),
    })),
  };
}

/**
 * Get operational analytics data.
 */
export async function getOperationalAnalytics(clinicId: string, range: DateRange) {
  const [totalAppointments, appointmentsByStatus, appointmentsByType] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: range.start, lte: range.end },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: {
          clinicId,
          date: { gte: range.start, lte: range.end },
        },
        _count: true,
      }),
      prisma.appointment.groupBy({
        by: ["type"],
        where: {
          clinicId,
          date: { gte: range.start, lte: range.end },
        },
        _count: true,
      }),
    ]);

  const statusCounts = appointmentsByStatus.reduce<Record<string, number>>(
    (acc, s) => ({ ...acc, [s.status]: s._count }),
    {}
  );

  const noShowRate =
    totalAppointments > 0
      ? ((statusCounts["no_show"] || 0) / totalAppointments) * 100
      : 0;

  return {
    totalAppointments,
    completedRate:
      totalAppointments > 0
        ? ((statusCounts["completed"] || 0) / totalAppointments) * 100
        : 0,
    noShowRate: Math.round(noShowRate * 10) / 10,
    cancelledRate:
      totalAppointments > 0
        ? ((statusCounts["cancelled"] || 0) / totalAppointments) * 100
        : 0,
    byStatus: statusCounts,
    byType: appointmentsByType.reduce<Record<string, number>>(
      (acc, t) => ({ ...acc, [t.type]: t._count }),
      {}
    ),
  };
}
