import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { parseRemedies } from "@/lib/repertory";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rubricId = Number(id);

    if (isNaN(rubricId)) {
      return NextResponse.json(
        { error: "Invalid rubric ID" },
        { status: 400 }
      );
    }

    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: { chapter: true },
    });

    if (!rubric) {
      return NextResponse.json(
        { error: "Rubric not found" },
        { status: 404 }
      );
    }

    const parsedRemedies = parseRemedies(rubric.remedies);

    return NextResponse.json({
      ...rubric,
      parsedRemedies,
    });
  } catch (error) {
    console.error("Error fetching rubric:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubric" },
      { status: 500 }
    );
  }
}
