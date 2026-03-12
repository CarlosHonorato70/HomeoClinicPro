import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const entries = await prisma.materiaMedica.findMany({
      where: { remedyCode: { equals: code, mode: "insensitive" } },
      orderBy: { source: "asc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching materia medica:", error);
    return NextResponse.json(
      { error: "Failed to fetch materia medica" },
      { status: 500 }
    );
  }
}
