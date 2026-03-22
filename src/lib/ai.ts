/**
 * HomeoClinic Pro — Propriedade de Carlos Honorato
 * Protegido pela Lei 9.609/1998 (Lei do Software)
 * Todos os direitos reservados. Copia e distribuicao proibidas.
 */
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { normalizeSearchTerm } from "@/lib/repertory";
import type { ScoredRemedy } from "@/lib/repertory";

// ========== Types ==========

export interface RubricMatch {
  id: number;
  chapterId: string;
  symptomPt: string;
  symptomEn: string | null;
  remedies: string;
  remedyCount: number;
  miasm: string | null;
}

export interface GroupedRubricMatch {
  symptom: string;
  rubrics: RubricMatch[];
}

export interface PrescriptionSuggestion {
  remedy: string;
  potency: string;
  dosage: string;
  frequency: string;
  reasoning: string;
  disclaimer: string;
}

// ========== OpenAI Client ==========

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada. Configure no .env.");
  }
  return new OpenAI({ apiKey });
}

// ========== 1. Parse Symptoms ==========

export async function parseSymptoms(naturalText: string): Promise<string[]> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um especialista em homeopatia e repertorização homeopática.
O médico descreverá os sintomas do paciente em linguagem natural em português.

Sua tarefa é extrair sintomas individuais como termos de busca para um repertório homeopático (tipo Kent).

Regras:
- Separe cada sintoma em um termo de busca curto e específico
- Inclua modalidades como termos separados (piora/melhora/agravação)
- Para cada sintoma em português, inclua também a tradução em inglês como termo adicional
- Mantenha termos concisos (2-5 palavras)
- Use terminologia de repertório homeopático quando possível

Retorne um JSON no formato: { "symptoms": ["termo1", "termo2", ...] }

Exemplo:
Input: "paciente com dor de cabeça frontal que piora com frio e melhora com pressão, ansiedade antes de dormir"
Output: { "symptoms": ["cefaleia frontal", "headache frontal", "cefaleia piora frio", "headache worse cold", "cefaleia melhora pressao", "headache better pressure", "ansiedade antes dormir", "anxiety before sleep"] }`,
      },
      {
        role: "user",
        content: naturalText,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.symptoms) ? parsed.symptoms : [];
  } catch {
    return [];
  }
}

// ========== 2. Search Rubrics for Symptoms ==========

export async function searchRubricsForSymptoms(
  symptoms: string[]
): Promise<GroupedRubricMatch[]> {
  const results: GroupedRubricMatch[] = [];

  for (const symptom of symptoms) {
    const searchPattern = normalizeSearchTerm(symptom);

    const rubrics = await prisma.$queryRawUnsafe<RubricMatch[]>(
      `
      SELECT id, "chapterId", "symptomPt", "symptomEn", remedies, "remedyCount", miasm
      FROM "Rubric"
      WHERE "symptomPt" ILIKE $1 OR "symptomEn" ILIKE $1
      ORDER BY similarity("symptomPt", $2) DESC
      LIMIT 10
      `,
      searchPattern,
      symptom
    );

    if (rubrics.length > 0) {
      results.push({ symptom, rubrics });
    }
  }

  // Deduplicate rubrics across symptom groups
  const seenIds = new Set<number>();
  for (const group of results) {
    group.rubrics = group.rubrics.filter((r) => {
      if (seenIds.has(r.id)) return false;
      seenIds.add(r.id);
      return true;
    });
  }

  // Remove empty groups after dedup
  return results.filter((g) => g.rubrics.length > 0);
}

// ========== 3. Generate Prescription ==========

export async function generatePrescription(
  results: ScoredRemedy[],
  selectedRubrics: { symptomPt: string; remedyCount: number }[],
  patientContext?: { age?: number; sex?: string; complaint?: string }
): Promise<PrescriptionSuggestion> {
  const openai = getOpenAI();

  const top15 = results.slice(0, 15);

  const remedySummary = top15
    .map(
      (r, i) =>
        `${i + 1}. ${r.name} — ${r.total} pts, presente em ${r.count}/${selectedRubrics.length} rubricas, grau máximo ${r.maxGrade}${r.eliminated ? " (ELIMINADO)" : ""}`
    )
    .join("\n");

  const rubricSummary = selectedRubrics
    .map((r) => `- ${r.symptomPt} (${r.remedyCount} remédios)`)
    .join("\n");

  const patientInfo = patientContext
    ? `\nContexto do paciente: ${patientContext.age ? `Idade: ${patientContext.age}` : ""} ${patientContext.sex ? `Sexo: ${patientContext.sex}` : ""} ${patientContext.complaint ? `Queixa principal: ${patientContext.complaint}` : ""}`
    : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um homeopata experiente com décadas de prática clínica.
Analise os resultados de repertorização homeopática e sugira uma prescrição.

Considere:
- O remédio mais pontuado E que cobre mais rubricas
- A totalidade dos sintomas (mentais > gerais > particulares)
- A potência adequada ao caso (6CH, 12CH, 30CH, 200CH, 1M)
- Regras clássicas: similimum, dose mínima, remédio único

IMPORTANTE: Sempre responda em português brasileiro.

Retorne um JSON com exatamente estes campos:
{
  "remedy": "nome do remédio principal (ex: Arsenicum album)",
  "potency": "potência sugerida (ex: 30CH)",
  "dosage": "posologia (ex: 3 glóbulos sublinguais)",
  "frequency": "frequência (ex: 2x ao dia por 15 dias)",
  "reasoning": "raciocínio clínico detalhado explicando a escolha (3-5 frases)",
  "disclaimer": "Esta é uma sugestão gerada por inteligência artificial. A decisão final sobre a prescrição é de responsabilidade exclusiva do médico homeopata."
}`,
      },
      {
        role: "user",
        content: `## Resultados da Repertorização

### Top 15 Remédios:
${remedySummary}

### Rubricas Selecionadas:
${rubricSummary}
${patientInfo}

Com base nestes dados, sugira a prescrição homeopática mais adequada.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Resposta vazia da IA");
  }

  try {
    const parsed = JSON.parse(content);
    return {
      remedy: parsed.remedy || "Não determinado",
      potency: parsed.potency || "30CH",
      dosage: parsed.dosage || "3 glóbulos sublinguais",
      frequency: parsed.frequency || "2x ao dia",
      reasoning: parsed.reasoning || "Análise indisponível",
      disclaimer:
        parsed.disclaimer ||
        "Esta é uma sugestão gerada por IA. A decisão final é do médico.",
    };
  } catch {
    throw new Error("Erro ao processar resposta da IA");
  }
}
