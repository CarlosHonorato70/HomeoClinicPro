import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { scientificName: { contains: q, mode: "insensitive" as const } },
          { commonNames: { contains: q, mode: "insensitive" as const } },
          { indications: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [plants, total] = await Promise.all([
    prisma.phytotherapyPlant.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offset,
      take: limit,
    }),
    prisma.phytotherapyPlant.count({ where }),
  ]);

  return NextResponse.json({
    plants,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
