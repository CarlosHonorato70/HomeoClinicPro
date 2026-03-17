import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { symptoms, remedy, caseId } = body;

  if (!symptoms && !remedy) {
    return NextResponse.json({ error: "Informe sintomas ou remédio para análise" }, { status: 400 });
  }

  const clinicId = session.user.clinicId;

  // Build search conditions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { clinicId };
  if (caseId) where.id = { not: caseId };

  // Fetch all cases from clinic (limited to 200 for performance)
  const allCases = await prisma.clinicalCase.findMany({
    where,
    select: {
      id: true,
      title: true,
      summary: true,
      symptoms: true,
      prescribedRemedy: true,
      potency: true,
      outcomeRating: true,
      tags: true,
      patientAge: true,
      patientSex: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Decrypt and find similar cases
  const searchTerms = (symptoms || "").toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const searchRemedy = (remedy || "").toLowerCase();

  type ScoredCase = {
    id: string;
    title: string;
    summary: string;
    symptoms: string;
    prescribedRemedy: string | null;
    potency: string | null;
    outcomeRating: number | null;
    tags: string | null;
    patientAge: number | null;
    patientSex: string | null;
    score: number;
  };

  const scored: ScoredCase[] = allCases.map((c) => {
    const decSummary = tryDecrypt(c.summary) || "";
    const decSymptoms = tryDecrypt(c.symptoms) || "";
    const text = `${decSummary} ${decSymptoms}`.toLowerCase();

    let score = 0;
    // Score by symptom keyword matches
    for (const term of searchTerms) {
      if (term.length >= 3 && text.includes(term)) score += 2;
    }
    // Score by remedy match
    if (searchRemedy && c.prescribedRemedy?.toLowerCase().includes(searchRemedy)) {
      score += 5;
    }
    // Bonus for high-rated outcomes
    if (c.outcomeRating && c.outcomeRating >= 4) score += 1;

    return {
      ...c,
      summary: decSummary,
      symptoms: decSymptoms,
      score,
    };
  });

  const similarCases = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Calculate statistics
  const totalSimilar = similarCases.length;
  const remedyCounts: Record<string, { count: number; goodOutcomes: number }> = {};

  for (const c of similarCases) {
    if (c.prescribedRemedy) {
      const r = c.prescribedRemedy;
      if (!remedyCounts[r]) remedyCounts[r] = { count: 0, goodOutcomes: 0 };
      remedyCounts[r].count++;
      if (c.outcomeRating && c.outcomeRating >= 4) remedyCounts[r].goodOutcomes++;
    }
  }

  const remedyStats = Object.entries(remedyCounts)
    .map(([name, data]) => ({
      remedy: name,
      count: data.count,
      successRate: data.count > 0 ? Math.round((data.goodOutcomes / data.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Generate AI insight if we have similar cases
  let aiInsight = null;
  if (similarCases.length >= 2 && process.env.OPENAI_API_KEY) {
    try {
      const caseSummaries = similarCases.slice(0, 5).map((c) => (
        `- Sintomas: ${c.symptoms.slice(0, 150)}; Remédio: ${c.prescribedRemedy || "N/A"} ${c.potency || ""}; Resultado: ${c.outcomeRating}/5`
      )).join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um assistente de homeopatia clínica. Analise os casos similares e forneça um breve insight sobre padrões observados. Responda em português, de forma concisa (máximo 3 frases).",
          },
          {
            role: "user",
            content: `Sintomas buscados: ${symptoms || "N/A"}\nRemédio buscado: ${remedy || "N/A"}\n\nCasos similares encontrados:\n${caseSummaries}\n\nResuma os padrões e sugira considerações clínicas.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      aiInsight = completion.choices[0]?.message?.content || null;
    } catch {
      // AI insight is optional — silently skip on error
    }
  }

  return NextResponse.json({
    totalSimilar,
    similarCases: similarCases.map((c) => ({
      id: c.id,
      title: c.title,
      summary: c.summary.slice(0, 200),
      prescribedRemedy: c.prescribedRemedy,
      potency: c.potency,
      outcomeRating: c.outcomeRating,
      patientAge: c.patientAge,
      patientSex: c.patientSex,
      score: c.score,
    })),
    remedyStats,
    aiInsight,
  });
}
