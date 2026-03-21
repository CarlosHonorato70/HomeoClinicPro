import { NextRequest, NextResponse } from "next/server";
import { verifyPatientToken } from "@/lib/patient-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyPatientToken(authHeader.slice(7));
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { patientId: payload.patientId },
    select: {
      id: true,
      type: true,
      title: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ documents });
}
