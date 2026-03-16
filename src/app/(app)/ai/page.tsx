"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Search,
  BookOpen,
  Pill,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Clipboard,
  FileText,
} from "lucide-react";
import type { RepertorizationMethod } from "@/lib/repertory";

// ========== Types ==========

interface RubricMatch {
  id: number;
  chapterId: string;
  symptomPt: string;
  symptomEn: string | null;
  remedies: string;
  remedyCount: number;
  miasm: string | null;
}

interface GroupedRubricMatch {
  symptom: string;
  rubrics: RubricMatch[];
}

interface RemedyResult {
  name: string;
  total: number;
  count: number;
  maxGrade: number;
  rubricDetails: { rubricId: number; grade: number }[];
  eliminated?: boolean;
}

interface Prescription {
  remedy: string;
  potency: string;
  dosage: string;
  frequency: string;
  reasoning: string;
  disclaimer: string;
}

// ========== Constants ==========

const METHOD_LABELS: Record<RepertorizationMethod, string> = {
  sum: "Soma de Graus",
  coverage: "Cobertura",
  kent: "Kent",
  boenninghausen: "Boenninghausen",
  hahnemann: "Hahnemann",
  algorithmic: "Algorítmico",
};

const STEPS = [
  { num: 1, label: "Sintomas" },
  { num: 2, label: "Rubricas" },
  { num: 3, label: "Repertorização" },
  { num: 4, label: "Prescrição" },
];

// ========== Main Component ==========

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Carregando...</div>}>
      <AIAssistantContent />
    </Suspense>
  );
}

function AIAssistantContent() {
  const searchParams = useSearchParams();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Symptoms
  const [symptomsText, setSymptomsText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Pre-fill from anamnesis
  useEffect(() => {
    const anamnesisData = searchParams.get("anamnesis");
    if (anamnesisData) {
      setSymptomsText(decodeURIComponent(anamnesisData));
    }
  }, [searchParams]);

  // Step 2: Rubric review
  const [parsedSymptoms, setParsedSymptoms] = useState<string[]>([]);
  const [rubricMatches, setRubricMatches] = useState<GroupedRubricMatch[]>([]);
  const [selectedRubricIds, setSelectedRubricIds] = useState<Set<number>>(
    new Set()
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Step 3: Repertorization
  const [method, setMethod] = useState<RepertorizationMethod>("sum");
  const [remedyResults, setRemedyResults] = useState<RemedyResult[]>([]);
  const [repertorizing, setRepertorizing] = useState(false);

  // Step 4: Prescription
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [prescribing, setPrescribing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Error
  const [error, setError] = useState("");

  // ---- Derived data ----

  const allRubrics = useMemo(() => {
    const map = new Map<number, RubricMatch>();
    for (const group of rubricMatches) {
      for (const r of group.rubrics) {
        map.set(r.id, r);
      }
    }
    return map;
  }, [rubricMatches]);

  const selectedRubrics = useMemo(
    () =>
      Array.from(selectedRubricIds)
        .map((id) => allRubrics.get(id))
        .filter(Boolean) as RubricMatch[],
    [selectedRubricIds, allRubrics]
  );

  const activeResults = useMemo(
    () => remedyResults.filter((r) => !r.eliminated),
    [remedyResults]
  );

  const maxScore = useMemo(
    () =>
      activeResults.length > 0
        ? Math.max(...activeResults.map((r) => r.total))
        : 1,
    [activeResults]
  );

  // ---- Step 1: Analyze Symptoms ----

  async function handleAnalyze() {
    if (!symptomsText.trim()) return;
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptomsText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao analisar sintomas");
        return;
      }

      setParsedSymptoms(data.parsedSymptoms || []);
      setRubricMatches(data.rubricMatches || []);

      // Auto-select all rubrics
      const ids = new Set<number>();
      for (const group of data.rubricMatches || []) {
        for (const r of group.rubrics) {
          ids.add(r.id);
        }
      }
      setSelectedRubricIds(ids);

      // Expand all groups
      setExpandedGroups(
        new Set((data.rubricMatches || []).map((g: GroupedRubricMatch) => g.symptom))
      );

      setStep(2);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }

  // ---- Step 2: Toggle rubric selection ----

  function toggleRubric(id: number) {
    setSelectedRubricIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleGroup(symptom: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) {
        next.delete(symptom);
      } else {
        next.add(symptom);
      }
      return next;
    });
  }

  // ---- Step 3: Repertorize ----

  async function handleRepertorize() {
    if (selectedRubricIds.size === 0) return;
    setRepertorizing(true);
    setError("");

    try {
      const res = await fetch("/api/repertory/repertorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          rubricConfigs: Array.from(selectedRubricIds).map((id) => ({
            id,
            intensity: 1,
            eliminated: false,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro na repertorização");
        return;
      }

      setRemedyResults(data.results || []);
      setStep(3);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setRepertorizing(false);
    }
  }

  // ---- Step 4: Generate Prescription ----

  async function handlePrescribe() {
    if (activeResults.length === 0) return;
    setPrescribing(true);
    setError("");

    try {
      const res = await fetch("/api/ai/prescribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: activeResults.slice(0, 15),
          rubrics: selectedRubrics.map((r) => ({
            symptomPt: r.symptomPt,
            remedyCount: r.remedyCount,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar prescrição");
        return;
      }

      setPrescription(data.prescription);
      setStep(4);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setPrescribing(false);
    }
  }

  // ---- Copy prescription ----

  function copyPrescription() {
    if (!prescription) return;
    const text = `PRESCRIÇÃO HOMEOPÁTICA (Sugestão IA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Remédio: ${prescription.remedy}
Potência: ${prescription.potency}
Posologia: ${prescription.dosage}
Frequência: ${prescription.frequency}

Raciocínio: ${prescription.reasoning}

⚠️ ${prescription.disclaimer}`;
    navigator.clipboard.writeText(text);
  }

  // ---- Reset ----

  function handleReset() {
    setStep(1);
    setSymptomsText("");
    setParsedSymptoms([]);
    setRubricMatches([]);
    setSelectedRubricIds(new Set());
    setRemedyResults([]);
    setPrescription(null);
    setError("");
  }

  // ========== Render ==========

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-teal-400" />
          Assistente IA
        </h1>
        <p className="text-gray-400 mt-1">
          Análise inteligente de sintomas com repertorização e prescrição
          assistida por IA
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => s.num < step && setStep(s.num)}
              disabled={s.num > step}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                s.num === step
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                  : s.num < step
                    ? "bg-teal-500/10 text-teal-500 cursor-pointer hover:bg-teal-500/20"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
              }`}
            >
              {s.num < step ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">
                  {s.num}
                </span>
              )}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-600 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-3">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ===== STEP 1: Symptom Input ===== */}
      {step === 1 && (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-teal-400" />
              Descreva os Sintomas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="Descreva os sintomas do paciente em linguagem natural...&#10;&#10;Exemplo: Paciente com cefaleia frontal pulsátil, piora com frio e ao ar livre, melhora com pressão local. Apresenta ansiedade marcante antes de dormir, insônia com pensamentos acelerados. Desejo de bebidas quentes. Suor frio nas extremidades."
              className="min-h-[200px] bg-[#0a0a0f] border-[#2a2a3a] text-gray-200 resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Inclua: sintomas mentais, gerais, particulares, modalidades
                (piora/melhora), desejos e aversões
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || symptomsText.trim().length < 10}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analisar Sintomas
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== STEP 2: Rubric Review ===== */}
      {step === 2 && (
        <>
          {/* Parsed symptoms */}
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="py-4">
              <p className="text-sm text-gray-400 mb-2">
                Sintomas identificados pela IA:
              </p>
              <div className="flex flex-wrap gap-2">
                {parsedSymptoms.map((s, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-teal-500/30 text-teal-400 text-xs"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rubric matches grouped by symptom */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedRubricIds.size} rubrica
                {selectedRubricIds.size !== 1 ? "s" : ""} selecionada
                {selectedRubricIds.size !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="border-white/10 text-gray-300 hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  onClick={handleRepertorize}
                  disabled={selectedRubricIds.size === 0 || repertorizing}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  {repertorizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Repertorizando...
                    </>
                  ) : (
                    <>
                      <FlaskConical className="h-4 w-4 mr-1" />
                      Repertorizar ({selectedRubricIds.size})
                    </>
                  )}
                </Button>
              </div>
            </div>

            {rubricMatches.map((group) => (
              <Card
                key={group.symptom}
                className="bg-[#111118] border-[#1e1e2e]"
              >
                <button
                  onClick={() => toggleGroup(group.symptom)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge className="bg-teal-500/10 text-teal-400 border-0 text-xs">
                      {group.rubrics.length}
                    </Badge>
                    <span className="text-sm font-medium text-gray-200">
                      {group.symptom}
                    </span>
                  </div>
                  {expandedGroups.has(group.symptom) ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {expandedGroups.has(group.symptom) && (
                  <CardContent className="pt-0 pb-3">
                    <div className="space-y-1">
                      {group.rubrics.map((rubric) => (
                        <label
                          key={rubric.id}
                          className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedRubricIds.has(rubric.id)
                              ? "bg-teal-500/10"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRubricIds.has(rubric.id)}
                            onChange={() => toggleRubric(rubric.id)}
                            className="mt-0.5 accent-teal-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200">
                              {rubric.symptomPt}
                            </p>
                            {rubric.symptomEn && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {rubric.symptomEn}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Cap. {rubric.chapterId}
                              </span>
                              <span className="text-xs text-gray-500">
                                {rubric.remedyCount} rem.
                              </span>
                              {rubric.miasm && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-purple-500/30 text-purple-400 py-0"
                                >
                                  {rubric.miasm}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {rubricMatches.length === 0 && (
              <Card className="bg-[#111118] border-[#1e1e2e]">
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    Nenhuma rubrica encontrada. O repertório pode não estar
                    seedado.
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Verifique se o repertório foi carregado no banco de dados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* ===== STEP 3: Repertorization Results ===== */}
      {step === 3 && (
        <>
          {/* Method selector */}
          <div className="flex items-center justify-between">
            <Tabs
              value={method}
              onValueChange={(v) => {
                setMethod(v as RepertorizationMethod);
              }}
            >
              <TabsList className="bg-[#111118] border border-white/10">
                {(
                  Object.entries(METHOD_LABELS) as [
                    RepertorizationMethod,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 text-xs"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Rubricas
              </Button>
              <Button
                onClick={handleRepertorize}
                disabled={repertorizing}
                size="sm"
                variant="outline"
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              >
                {repertorizing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <FlaskConical className="h-4 w-4 mr-1" />
                )}
                Re-repertorizar
              </Button>
            </div>
          </div>

          {/* Rankings */}
          <Card className="bg-[#111118] border-[#1e1e2e] p-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Pill className="h-4 w-4 text-teal-500" />
              Ranking — Top {activeResults.length} Remédios
            </h2>

            {activeResults.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Nenhum resultado encontrado.
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeResults.map((remedy, index) => {
                  const barWidth = (remedy.total / maxScore) * 100;
                  return (
                    <div
                      key={`${remedy.name}-${index}`}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-500 w-7 text-right shrink-0 tabular-nums">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-200 w-28 shrink-0 font-mono truncate">
                        {remedy.name}
                      </span>
                      <div className="flex-1 h-7 bg-white/5 rounded overflow-hidden relative">
                        <div
                          className="h-full rounded bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2 justify-end">
                          <span className="text-xs text-gray-200 font-medium tabular-nums">
                            {remedy.total} pts
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right shrink-0 tabular-nums">
                        {remedy.count}/{selectedRubrics.length} rubr.
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Generate Prescription Button */}
          <div className="flex justify-end">
            <Button
              onClick={handlePrescribe}
              disabled={prescribing || activeResults.length === 0}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {prescribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Gerando Prescrição...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Prescrição com IA
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* ===== STEP 4: AI Prescription ===== */}
      {step === 4 && prescription && (
        <>
          {/* Prescription Card */}
          <Card className="bg-[#111118] border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-teal-400" />
                Prescrição Homeopática — Sugestão IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Remédio
                  </p>
                  <p className="text-xl font-bold text-teal-400">
                    {prescription.remedy}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Potência
                  </p>
                  <p className="text-xl font-bold text-gray-200">
                    {prescription.potency}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Posologia
                  </p>
                  <p className="text-sm text-gray-200">
                    {prescription.dosage}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Frequência
                  </p>
                  <p className="text-sm text-gray-200">
                    {prescription.frequency}
                  </p>
                </div>
              </div>

              {/* Reasoning (collapsible) */}
              <div>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showReasoning ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Raciocínio Clínico
                </button>
                {showReasoning && (
                  <div className="mt-2 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {prescription.reasoning}
                    </p>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">
                  {prescription.disclaimer}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(3)}
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao Ranking
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyPrescription}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                <Clipboard className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button onClick={handleReset} className="bg-teal-600 hover:bg-teal-700">
                <FileText className="h-4 w-4 mr-1" />
                Nova Análise
              </Button>
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Resumo da Análise
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{parsedSymptoms.length} sintomas identificados</span>
                <span className="text-gray-600">|</span>
                <span>{selectedRubrics.length} rubricas selecionadas</span>
                <span className="text-gray-600">|</span>
                <span>{activeResults.length} remédios analisados</span>
                <span className="text-gray-600">|</span>
                <span>Método: {METHOD_LABELS[method]}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
