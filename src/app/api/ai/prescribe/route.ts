import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePrescription } from "@/lib/ai";
import type { ScoredRemedy } from "@/lib/repertory";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { results, rubrics, patientContext } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Resultados de repertorização são obrigatórios" },
        { status: 400 }
      );
    }

    if (!rubrics || !Array.isArray(rubrics) || rubrics.length === 0) {
      return NextResponse.json(
        { error: "Rubricas selecionadas são obrigatórias" },
        { status: 400 }
      );
    }

    const prescription = await generatePrescription(
      results as ScoredRemedy[],
      rubrics as { symptomPt: string; remedyCount: number }[],
      patientContext
    );

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error("Error in AI prescribe:", error);

    const message =
      error instanceof Error && error.message.includes("OPENAI_API_KEY")
        ? "API de IA não configurada. Contate o administrador."
        : "Erro ao gerar prescrição. Tente novamente.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
