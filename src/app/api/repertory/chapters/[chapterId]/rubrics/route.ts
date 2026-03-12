import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const [rubrics, total] = await Promise.all([
      prisma.rubric.findMany({
        where: { chapterId: chapterId },
        skip,
        take: limit,
        orderBy: { symptomPt: "asc" },
      }),
      prisma.rubric.count({
        where: { chapterId: chapterId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      rubrics,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching rubrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubrics" },
      { status: 500 }
    );
  }
}
