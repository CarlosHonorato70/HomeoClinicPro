import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { financialSchema } from "@/lib/validations";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json({ error: "Query params 'month' and 'year' are required" }, { status: 400 });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.financial.findMany({
    where: {
      clinicId: session.user.clinicId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      patient: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = financialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const transaction = await prisma.financial.create({
    data: {
      clinicId: session.user.clinicId,
      date: new Date(data.date),
      type: data.type,
      description: data.description,
      patientId: data.patientId || null,
      amount: data.amount,
      category: data.category || null,
      createdBy: session.user.id,
    },
    include: {
      patient: { select: { id: true, name: true } },
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.FINANCIAL_NEW,
    details: `Transação criada: ${data.type} - ${data.description} - R$ ${data.amount.toFixed(2)}`,
  });

  return NextResponse.json(transaction, { status: 201 });
}
