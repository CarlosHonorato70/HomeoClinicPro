import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const remedy = await prisma.remedy.findFirst({
      where: { code: { equals: code, mode: "insensitive" } },
    });

    if (!remedy) {
      return NextResponse.json(
        { error: "Remedy not found" },
        { status: 404 }
      );
    }

    // Count rubrics containing this remedy
    const pattern = `%${remedy.code}%`;
    const rubricCountResult = await prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) as count FROM "Rubric" WHERE "remedies" ILIKE ${pattern}`;

    const rubricCount = Number(rubricCountResult[0]?.count ?? 0);

    // Fetch correlates for this remedy
    const correlates = await prisma.remedyCorrelate.findMany({
      where: { term: { equals: remedy.code, mode: "insensitive" } },
      orderBy: { relatedTerm: "asc" },
    });

    return NextResponse.json({
      remedy,
      rubricCount,
      correlates,
    });
  } catch (error) {
    console.error("Error fetching remedy:", error);
    return NextResponse.json(
      { error: "Failed to fetch remedy" },
      { status: 500 }
    );
  }
}
