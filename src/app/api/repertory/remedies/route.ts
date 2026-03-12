import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const where = q && q.trim().length > 0
      ? { name: { contains: q, mode: "insensitive" as const } }
      : {};

    const [remedies, total] = await Promise.all([
      prisma.remedy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.remedy.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ remedies, total, page, totalPages });
  } catch (error) {
    console.error("Error fetching remedies:", error);
    return NextResponse.json(
      { error: "Failed to fetch remedies" },
      { status: 500 }
    );
  }
}
