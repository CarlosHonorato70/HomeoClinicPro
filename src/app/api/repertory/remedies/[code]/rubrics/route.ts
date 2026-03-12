import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RawRubric {
  id: number;
  chapterId: string;
  symptomPt: string;
  symptomEn: string | null;
  remedies: string;
  remedyCount: number;
  miasm: string | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const chapter = searchParams.get("chapter");
    const offset = (page - 1) * limit;

    const pattern = `%${code}%`;

    // Count total and fetch paginated rubrics
    let total: number;
    let rubrics: RawRubric[];

    if (chapter) {
      const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Rubric"
        WHERE "remedies" ILIKE ${pattern} AND "chapterId" = ${chapter}
      `;
      total = Number(countResult[0]?.count ?? 0);

      rubrics = await prisma.$queryRaw<RawRubric[]>`
        SELECT "id", "chapterId", "symptomPt", "symptomEn", "remedies", "remedyCount", "miasm"
        FROM "Rubric"
        WHERE "remedies" ILIKE ${pattern} AND "chapterId" = ${chapter}
        ORDER BY "symptomPt" ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Rubric"
        WHERE "remedies" ILIKE ${pattern}
      `;
      total = Number(countResult[0]?.count ?? 0);

      rubrics = await prisma.$queryRaw<RawRubric[]>`
        SELECT "id", "chapterId", "symptomPt", "symptomEn", "remedies", "remedyCount", "miasm"
        FROM "Rubric"
        WHERE "remedies" ILIKE ${pattern}
        ORDER BY "symptomPt" ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const totalPages = Math.ceil(total / limit);

    // Parse each rubric to extract the grade of the requested remedy
    const upperCode = code.toUpperCase();
    const rubricsWithGrade = rubrics.map((rubric) => {
      const tokens = rubric.remedies.trim().split(/\s+/);
      let grade = 0;
      for (const token of tokens) {
        if (token.toUpperCase() === upperCode) {
          if (token === token.toUpperCase() && token.length > 1) {
            grade = 3;
          } else if (
            token[0] === token[0].toUpperCase() &&
            token.length > 1
          ) {
            grade = 2;
          } else {
            grade = 1;
          }
          break;
        }
      }

      return {
        id: rubric.id,
        chapterId: rubric.chapterId,
        symptomPt: rubric.symptomPt,
        symptomEn: rubric.symptomEn,
        remedyCount: rubric.remedyCount,
        miasm: rubric.miasm,
        remedyGrade: grade,
      };
    });

    return NextResponse.json({
      rubrics: rubricsWithGrade,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching remedy rubrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubrics" },
      { status: 500 }
    );
  }
}
