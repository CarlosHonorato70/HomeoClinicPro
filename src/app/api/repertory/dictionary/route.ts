import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const q = req.nextUrl.searchParams.get("q");
    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 10));

    const entries = await prisma.medicalDictionary.findMany({
      where: {
        term: { startsWith: q.trim(), mode: "insensitive" },
      },
      orderBy: { term: "asc" },
      take: limit,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
