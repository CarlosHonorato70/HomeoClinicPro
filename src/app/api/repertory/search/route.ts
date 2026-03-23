import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeSearchTerm } from "@/lib/repertory";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const chapter = searchParams.get("chapter");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const offset = (page - 1) * limit;

    const searchPattern = normalizeSearchTerm(q);

    let results;
    if (chapter) {
      results = await prisma.$queryRawUnsafe(
        `
        SELECT id, "chapterId", "symptomPt", "symptomEn", remedies, "remedyCount", miasm
        FROM "Rubric"
        WHERE ("symptomPt" ILIKE $1 OR "symptomEn" ILIKE $1)
          AND "chapterId" = $2
        ORDER BY similarity("symptomPt", $3) DESC
        LIMIT $4 OFFSET $5
        `,
        searchPattern,
        chapter,
        q.trim(),
        limit,
        offset
      );
    } else {
      results = await prisma.$queryRawUnsafe(
        `
        SELECT id, "chapterId", "symptomPt", "symptomEn", remedies, "remedyCount", miasm
        FROM "Rubric"
        WHERE "symptomPt" ILIKE $1 OR "symptomEn" ILIKE $1
        ORDER BY similarity("symptomPt", $2) DESC
        LIMIT $3 OFFSET $4
        `,
        searchPattern,
        q.trim(),
        limit,
        offset
      );
    }

    return NextResponse.json({
      rubrics: results,
      query: q,
    });
  } catch (error) {
    console.error("Error searching rubrics:", error);
    return NextResponse.json(
      { error: "Failed to search rubrics" },
      { status: 500 }
    );
  }
}
