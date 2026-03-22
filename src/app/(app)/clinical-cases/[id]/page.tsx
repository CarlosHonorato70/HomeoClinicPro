"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookMarked,
  ArrowLeft,
  Star,
  Pill,
  User,
  Calendar,
  Tag,
  FileText,
  Stethoscope,
  Activity,
  Sparkles,
  Trash2,
  Brain,
  TrendingUp,
  Loader2,
  Edit3,
  Save,
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface SimilarCase {
  id: string;
  title: string;
  summary: string;
  prescribedRemedy: string | null;
  potency: string | null;
  outcomeRating: number | null;
  score: number;
}

interface RemedyStat {
  remedy: string;
  count: number;
  successRate: number;
}

interface AnalysisResult {
  totalSimilar: number;
  similarCases: SimilarCase[];
  remedyStats: RemedyStat[];
  aiInsight: string | null;
}

interface ClinicalCaseDetail {
  id: string;
  title: string;
  summary: string;
  symptoms: string;
  rubrics: string | null;
  repertorization: string | null;
  prescribedRemedy: string | null;
  potency: string | null;
  outcome: string | null;
  outcomeRating: number | null;
  tags: string | null;
  patientAge: number | null;
  patientSex: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { name: string };
}

export default function ClinicalCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caseData, setCaseData] = useState<ClinicalCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Expert System state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Feedback loop state
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolOutcome, setEvolOutcome] = useState("");
  const [evolRating, setEvolRating] = useState(0);
  const [savingEvolution, setSavingEvolution] = useState(false);

  useEffect(() => {
    fetch(`/api/clinical-cases/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCaseData(data))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-analyze when case loads
  const runAnalysis = useCallback(async () => {
    if (!caseData) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/clinical-cases/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: caseData.symptoms,
          remedy: caseData.prescribedRemedy || "",
          caseId: caseData.id,
        }),
      });
      if (res.ok) setAnalysis(await res.json());
    } catch { /* ignore */ }
    setAnalyzing(false);
  }, [caseData]);

  useEffect(() => {
    if (caseData) runAnalysis();
  }, [caseData, runAnalysis]);

  async function handleSaveEvolution() {
    if (!evolOutcome.trim() && !evolRating) return;
    setSavingEvolution(true);
    try {
      const newOutcome = caseData?.outcome
        ? `${caseData.outcome}\n\n--- Evolução ${new Date().toLocaleDateString("pt-BR")} ---\n${evolOutcome}`
        : evolOutcome;
      const res = await fetch(`/api/clinical-cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: newOutcome,
          outcomeRating: evolRating || caseData?.outcomeRating,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCaseData(updated);
        setShowEvolution(false);
        setEvolOutcome("");
        setEvolRating(0);
      }
    } catch { /* ignore */ }
    setSavingEvolution(false);
  }

  async function handleDelete() {
    if (!confirm("Deseja excluir este caso clinico?")) return;
    setDeleting(true);
    const res = await fetch(`/api/clinical-cases/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/clinical-cases");
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 bg-[#1e1e2e] rounded w-48 animate-pulse" />
        <Card className="bg-[#111118] border-[#1e1e2e] animate-pulse">
          <CardContent className="pt-6"><div className="h-60 bg-[#1e1e2e] rounded" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Caso nao encontrado.</p>
        <Link href="/clinical-cases" className="text-teal-400 hover:underline text-sm mt-2 block">
          Voltar
        </Link>
      </div>
    );
  }

  const ratingLabels: Record<number, string> = {
    1: "Sem melhora",
    2: "Melhora leve",
    3: "Melhora moderada",
    4: "Melhora significativa",
    5: "Cura completa",
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clinical-cases">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-teal-400" />
            {caseData.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/ai?symptoms=${encodeURIComponent(caseData.symptoms)}`}>
            <Button variant="outline" size="sm" className="border-[#1e1e2e] text-indigo-400">
              <Sparkles className="h-4 w-4 mr-1" /> Usar como Referencia
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(caseData.createdAt).toLocaleDateString("pt-BR")}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {caseData.createdBy.name}
        </span>
        {caseData.patientAge && (
          <span>Paciente: {caseData.patientAge} anos, {caseData.patientSex === "M" ? "Masculino" : "Feminino"}</span>
        )}
        {caseData.outcomeRating && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i <= caseData.outcomeRating! ? "text-amber-400 fill-amber-400" : "text-gray-600"}`}
              />
            ))}
            <span className="text-amber-400 ml-1">{ratingLabels[caseData.outcomeRating]}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {caseData.tags && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-gray-500" />
          {caseData.tags.split(",").map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#1e1e2e] text-gray-400 text-xs">
              {tag.trim()}
            </Badge>
          ))}
        </div>
      )}

      {/* Prescription */}
      {caseData.prescribedRemedy && (
        <Card className="bg-teal-500/5 border-teal-500/20">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-400/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Prescricao</p>
              <p className="text-lg font-semibold text-teal-300">
                {caseData.prescribedRemedy} {caseData.potency && `— ${caseData.potency}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            Resumo do Caso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-300 whitespace-pre-wrap text-sm">{caseData.summary}</p>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-amber-400" />
            Sintomas Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-300 whitespace-pre-wrap text-sm">{caseData.symptoms}</p>
        </CardContent>
      </Card>

      {/* Outcome */}
      {caseData.outcome && (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Evolucao / Resultado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-300 whitespace-pre-wrap text-sm">{caseData.outcome}</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Loop — Register Evolution */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-teal-400" />
              Registrar Evolucao
            </span>
            {!showEvolution && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEvolution(true)}
                className="border-[#1e1e2e] text-teal-400 text-xs"
              >
                Adicionar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        {showEvolution && (
          <CardContent className="pt-0 space-y-3">
            <Textarea
              value={evolOutcome}
              onChange={(e) => setEvolOutcome(e.target.value)}
              placeholder="Descreva a evolucao do paciente..."
              className="bg-[#0a0a0f] border-[#1e1e2e] min-h-[80px]"
            />
            <div>
              <p className="text-xs text-gray-500 mb-1">Novo rating de resultado:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setEvolRating(i)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-5 w-5 cursor-pointer transition-colors ${
                        i <= evolRating ? "text-amber-400 fill-amber-400" : "text-gray-600 hover:text-amber-300"
                      }`}
                    />
                  </button>
                ))}
                {evolRating > 0 && (
                  <span className="text-xs text-amber-400 ml-2">{ratingLabels[evolRating]}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowEvolution(false); setEvolOutcome(""); setEvolRating(0); }}
                className="text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEvolution}
                disabled={savingEvolution || (!evolOutcome.trim() && !evolRating)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {savingEvolution ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Salvar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Expert System — Similar Cases & AI Insight */}
      <Card className="bg-[#111118] border-indigo-500/20">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            Expert System — Analise de Padroes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {analyzing ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando casos similares...
            </div>
          ) : analysis ? (
            <>
              {/* AI Insight */}
              {analysis.aiInsight && (
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                  <p className="text-xs text-indigo-400 font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Insight da IA
                  </p>
                  <p className="text-sm text-gray-300">{analysis.aiInsight}</p>
                </div>
              )}

              {/* Remedy Statistics */}
              {analysis.remedyStats.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Estatisticas de Prescricao
                  </p>
                  <div className="space-y-2">
                    {analysis.remedyStats.map((r) => (
                      <div key={r.remedy} className="flex items-center justify-between py-1.5 px-3 rounded bg-white/[0.02] border border-white/5">
                        <span className="text-sm text-teal-300 font-medium">{r.remedy}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-400">{r.count} caso(s)</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              r.successRate >= 70
                                ? "border-green-500/30 text-green-400"
                                : r.successRate >= 40
                                  ? "border-amber-500/30 text-amber-400"
                                  : "border-red-500/30 text-red-400"
                            }`}
                          >
                            {r.successRate}% sucesso
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Cases */}
              {analysis.similarCases.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    {analysis.totalSimilar} caso(s) similar(es) encontrado(s)
                  </p>
                  <div className="space-y-2">
                    {analysis.similarCases.slice(0, 5).map((c) => (
                      <Link key={c.id} href={`/clinical-cases/${c.id}`}>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-200">{c.title}</span>
                            <div className="flex items-center gap-2">
                              {c.prescribedRemedy && (
                                <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-400">
                                  {c.prescribedRemedy} {c.potency || ""}
                                </Badge>
                              )}
                              {c.outcomeRating && (
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      className={`h-2.5 w-2.5 ${i <= c.outcomeRating! ? "text-amber-400 fill-amber-400" : "text-gray-600"}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{c.summary}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {analysis.totalSimilar === 0 && (
                <p className="text-sm text-gray-500 py-2">
                  Nenhum caso similar encontrado na base. A análise será mais rica conforme mais casos forem registrados.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 py-2">Nao foi possivel analisar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
