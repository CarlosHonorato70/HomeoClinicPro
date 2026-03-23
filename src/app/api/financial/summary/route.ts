import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    requirePermission(session, "view_financial");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  }

  return NextResponse.json({
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: transactions.length,
  });
}
