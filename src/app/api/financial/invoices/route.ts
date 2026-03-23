import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    requirePermission(session, "view_financial");

    const params = req.nextUrl.searchParams;
    const status = params.get("status");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 20));

    const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
    const where: Record<string, unknown> = { clinicId: session.user.clinicId };
    if (status && validStatuses.includes(status)) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("permissão") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    requirePermission(session, "manage_financial");

    const body = await req.json();
    const { patientId, items, subtotal, tax, total, dueDate, notes } = body;

    if (!patientId || !items || !total || !dueDate) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Data de vencimento inválida" }, { status: 400 });
    }

    // Use transaction to prevent race condition on invoice numbers
    const invoice = await prisma.$transaction(async (tx) => {
      const lastInvoice = await tx.invoice.findFirst({
        where: { clinicId: session.user.clinicId },
        orderBy: { createdAt: "desc" },
        select: { number: true },
      });

      const lastNum = lastInvoice ? parseInt(lastInvoice.number.replace(/\D/g, "")) : 0;
      const invoiceNumber = `HC-${String(lastNum + 1).padStart(6, "0")}`;

      return tx.invoice.create({
        data: {
          clinicId: session.user.clinicId,
          patientId,
          number: invoiceNumber,
          items: JSON.stringify(items),
          subtotal: subtotal || total,
          tax: tax || 0,
          total,
          dueDate: parsedDate,
          notes: notes || null,
        },
      });
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("permissão") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
