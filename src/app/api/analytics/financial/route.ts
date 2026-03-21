import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getFinancialAnalytics, parseDateRange } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    requirePermission(session, "manage_billing");

    if (!session.user.clinicId) {
      return NextResponse.json({ error: "Clínica não configurada" }, { status: 400 });
    }

    const params = req.nextUrl.searchParams;
    const range = parseDateRange(params.get("start"), params.get("end"));
    const data = await getFinancialAnalytics(session.user.clinicId, range);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("permissão") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
