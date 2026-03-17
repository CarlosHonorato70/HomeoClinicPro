import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requirePermission(session, "view_audit");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const action = searchParams.get("action");

  const where: Record<string, unknown> = {
    clinicId: session.user.clinicId,
  };

  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, unknown>).gte = new Date(from);
    if (to) (where.timestamp as Record<string, unknown>).lte = new Date(to);
  }

  if (action) {
    where.action = action;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { timestamp: "desc" },
  });

  const csvHeaders = "timestamp,action,user,details,ip";
  const csvRows = logs.map((log) => {
    const timestamp = log.timestamp.toISOString();
    const actionField = log.action;
    const user = log.user?.name || "";
    const details = (log.details || "").replace(/"/g, '""');
    const ip = log.ip || "";
    return `"${timestamp}","${actionField}","${user}","${details}","${ip}"`;
  });

  const csv = [csvHeaders, ...csvRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="audit-log-export.csv"',
    },
  });
}
