import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getOperationalAnalytics, parseDateRange } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const range = parseDateRange(params.get("start"), params.get("end"));

  const data = await getOperationalAnalytics(session.user.clinicId, range);
  return NextResponse.json(data);
}
