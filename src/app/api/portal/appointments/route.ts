import { NextRequest, NextResponse } from "next/server";
import { verifyPatientToken } from "@/lib/patient-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const payload = verifyPatientToken(authHeader.slice(7));
    if (!payload) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: payload.patientId,
        date: { gte: new Date() },
        status: { not: "cancelled" },
      },
      select: {
        id: true,
        date: true,
        time: true,
        duration: true,
        type: true,
        status: true,
      },
      orderBy: { date: "asc" },
      take: 10,
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
