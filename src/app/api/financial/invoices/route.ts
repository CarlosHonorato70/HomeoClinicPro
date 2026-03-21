import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requirePermission(session, "view_financial");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 20));

  const where: Record<string, unknown> = { clinicId: session.user.clinicId };
  if (status) where.status = status;

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
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requirePermission(session, "manage_financial");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { patientId, items, subtotal, tax, total, dueDate, notes } = body;

  if (!patientId || !items || !total || !dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Generate sequential invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    where: { clinicId: session.user.clinicId },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });

  const lastNum = lastInvoice ? parseInt(lastInvoice.number.replace(/\D/g, "")) : 0;
  const invoiceNumber = `HC-${String(lastNum + 1).padStart(6, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      clinicId: session.user.clinicId,
      patientId,
      number: invoiceNumber,
      items: JSON.stringify(items),
      subtotal: subtotal || total,
      tax: tax || 0,
      total,
      dueDate: new Date(dueDate),
      notes,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
