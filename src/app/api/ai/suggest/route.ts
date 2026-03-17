import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSearchTerm } from "@/lib/repertory";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { keywords } = body;

    if (!keywords || typeof keywords !== "string" || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: "Campo 'keywords' é obrigatório" },
        { status: 400 }
      );
    }

    const searchPattern = normalizeSearchTerm(keywords);

    const results = await prisma.$queryRawUnsafe(
      `
      SELECT id, "chapterId", "symptomPt", "symptomEn", remedies, "remedyCount", miasm
      FROM "Rubric"
      WHERE "symptomPt" ILIKE $1 OR "symptomEn" ILIKE $1
      ORDER BY similarity("symptomPt", $2) DESC
      LIMIT 20
      `,
      searchPattern,
      keywords.trim()
    );

    return NextResponse.json({
      rubrics: results,
      keywords,
    });
  } catch (error) {
    console.error("Error in AI suggest:", error);
    return NextResponse.json(
      { error: "Falha ao buscar sugestões" },
      { status: 500 }
    );
  }
}
