import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ miasm: string }> }
) {
  try {
    const { miasm } = await params;
    const { searchParams } = new URL(req.url);
    const authority = searchParams.get("authority");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));

    const where = {
      miasm: { equals: miasm.toUpperCase(), mode: "insensitive" as const },
      ...(authority ? { authority: { equals: authority, mode: "insensitive" as const } } : {}),
    };

    const [classifications, total] = await Promise.all([
      prisma.miasmClassification.findMany({
        where,
        orderBy: { remedyCode: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.miasmClassification.count({ where }),
    ]);

    return NextResponse.json({
      miasm: miasm.toUpperCase(),
      classifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching miasm remedies:", error);
    return NextResponse.json(
      { error: "Failed to fetch miasm data" },
      { status: 500 }
    );
  }
}
