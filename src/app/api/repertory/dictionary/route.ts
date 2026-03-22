import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    const where = q.trim().length >= 2
      ? {
          OR: [
            { term: { contains: q.trim(), mode: "insensitive" as const } },
            { definition: { contains: q.trim(), mode: "insensitive" as const } },
          ],
        }
      : {};

    const [entries, total] = await Promise.all([
      prisma.medicalDictionary.findMany({
        where,
        orderBy: { term: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.medicalDictionary.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
