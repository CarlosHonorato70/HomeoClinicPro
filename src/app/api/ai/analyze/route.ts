import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseSymptoms, searchRubricsForSymptoms } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { symptoms } = body;

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Descreva os sintomas do paciente (mínimo 3 caracteres)" },
        { status: 400 }
      );
    }

    // Step 1: Parse natural language into discrete symptoms
    const parsedSymptoms = await parseSymptoms(symptoms.trim());

    if (parsedSymptoms.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível extrair sintomas do texto. Tente reformular." },
        { status: 422 }
      );
    }

    // Step 2: Search repertory for each symptom
    const rubricMatches = await searchRubricsForSymptoms(parsedSymptoms);

    return NextResponse.json({
      parsedSymptoms,
      rubricMatches,
    });
  } catch (error) {
    console.error("Error in AI analyze:", error);

    const message =
      error instanceof Error && error.message.includes("OPENAI_API_KEY")
        ? "API de IA não configurada. Contate o administrador."
        : "Erro ao analisar sintomas. Tente novamente.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
