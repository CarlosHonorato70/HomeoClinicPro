"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useRepertorization } from "@/contexts/repertorization-context";
import type { RepertorizationMethod } from "@/lib/repertory";
import {
  ArrowLeft,
  X,
  Loader2,
  Pill,
  Trash2,
  FlaskConical,
} from "lucide-react";

// ---------- Types ----------

interface RubricDetail {
  rubricId: number;
  grade: number;
}

interface RemedyResult {
  name: string;
  total: number;
  count: number;
  maxGrade: number;
  rubricDetails: RubricDetail[];
  eliminated?: boolean;
}

interface RepertorizationResponse {
  results: RemedyResult[];
  rubricCount: number;
  method: string;
}

// ---------- Constants ----------

const METHOD_LABELS: Record<RepertorizationMethod, string> = {
  sum: "Soma de Graus",
  coverage: "Cobertura",
  kent: "Kent",
  boenninghausen: "Boenninghausen",
  hahnemann: "Hahnemann",
  algorithmic: "Algorítmico",
};

const WEIGHT_LABELS: Record<string, string> = {
  mental: "Mental",
  general: "Geral",
  particular: "Particular",
};

const CATEGORY_LABELS: Record<string, string> = {
  location: "Localiza\u00e7\u00e3o",
  sensation: "Sensa\u00e7\u00e3o",
  modality: "Modalidade",
  concomitant: "Concomitante",
};

// ---------- Helpers ----------

function IntensityDots({
  value,
  onChange,
}: {
  value: 1 | 2 | 3;
  onChange: (v: 1 | 2 | 3) => void;
}) {
  return (
    <div className="flex items-center gap-1" title="Intensidade">
      {([1, 2, 3] as const).map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`w-3 h-3 rounded-full border transition-colors ${
            level <= value
              ? "bg-teal-500 border-teal-400"
              : "bg-transparent border-white/20 hover:border-white/40"
          }`}
          aria-label={`Intensidade ${level}`}
        />
      ))}
    </div>
  );
}

function GradeCell({ grade }: { grade: number | undefined }) {
  if (!grade) return <td className="border border-white/5 px-1 py-0.5" />;

  const styles =
    grade === 3
      ? "bg-teal-500/60 text-white font-bold"
      : grade === 2
        ? "bg-teal-500/30 text-teal-200"
        : "bg-teal-500/10 text-teal-400";

  return (
    <td
      className={`border border-white/5 px-1 py-0.5 text-center text-xs ${styles}`}
    >
      {grade}
    </td>
  );
}

// ---------- Main Component ----------

export default function RepertorizePage() {
  const {
    selectedRubrics,
    removeRubric,
    clearRubrics,
    setRubricWeight,
    setRubricCategory,
    setRubricIntensity,
    toggleElimination,
  } = useRepertorization();

  const [method, setMethod] = useState<RepertorizationMethod>("sum");
  const [results, setResults] = useState<RemedyResult[]>([]);
  const [rubricCount, setRubricCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // ---- Derived data ----

  const activeResults = useMemo(
    () => results.filter((r) => !r.eliminated),
    [results]
  );
  const eliminatedResults = useMemo(
    () => results.filter((r) => r.eliminated),
    [results]
  );
  const maxScore = useMemo(
    () =>
      activeResults.length > 0
        ? Math.max(...activeResults.map((r) => r.total))
        : 1,
    [activeResults]
  );

  // Top 20 remedies for the grid
  const gridRemedies = useMemo(() => results.slice(0, 20), [results]);

  // Build a lookup: rubricId -> remedyName -> grade
  const gradeMap = useMemo(() => {
    const map = new Map<number, Map<string, number>>();
    for (const remedy of gridRemedies) {
      for (const detail of remedy.rubricDetails) {
        if (!map.has(detail.rubricId)) {
          map.set(detail.rubricId, new Map());
        }
        map.get(detail.rubricId)!.set(remedy.name, detail.grade);
      }
    }
    return map;
  }, [gridRemedies]);

  // ---- Actions ----

  async function handleRepertorize() {
    if (selectedRubrics.length === 0) return;

    setLoading(true);
    setHasRun(false);
    try {
      const res = await fetch("/api/repertory/repertorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          rubricConfigs: selectedRubrics.map((r) => ({
            id: r.id,
            weight: r.weight,
            category: r.category,
            intensity: r.intensity ?? 1,
            eliminated: r.eliminated ?? false,
          })),
        }),
      });

      if (!res.ok) {
        setResults([]);
        return;
      }

      const data: RepertorizationResponse = await res.json();
      setResults(data.results ?? []);
      setRubricCount(data.rubricCount ?? selectedRubrics.length);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setHasRun(true);
    }
  }

  function handleClear() {
    clearRubrics();
    setResults([]);
    setHasRun(false);
  }

  // ---- Render ----

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/repertory">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Repertoriza&ccedil;&atilde;o
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              An&aacute;lise dos rem&eacute;dios mais indicados com base nas
              rubricas selecionadas
            </p>
          </div>
        </div>
        <Link href="/repertory">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar ao Repert&oacute;rio
          </Button>
        </Link>
      </div>

      {/* ===== Method Selector ===== */}
      <Tabs
        value={method}
        onValueChange={(v) =>
          setMethod((v as RepertorizationMethod) ?? "sum")
        }
      >
        <TabsList className="bg-[#111118] border border-white/10">
          {(
            Object.entries(METHOD_LABELS) as [RepertorizationMethod, string][]
          ).map(([key, label]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Invisible tab contents -- the method just controls the rubric config UI */}
        {Object.keys(METHOD_LABELS).map((key) => (
          <TabsContent key={key} value={key} className="mt-0" />
        ))}
      </Tabs>

      {/* ===== Selected Rubrics Card ===== */}
      <Card className="bg-[#111118] border-white/10 p-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-teal-500" />
          Rubricas Selecionadas ({selectedRubrics.length})
        </h2>

        {selectedRubrics.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            Selecione rubricas no Repert&oacute;rio para repertorizar.
          </p>
        ) : (
          <div className="space-y-1.5">
            {selectedRubrics.map((rubric) => (
              <div
                key={rubric.id}
                className={`flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 transition-opacity ${
                  rubric.eliminated ? "opacity-40" : ""
                }`}
              >
                {/* Chapter badge */}
                <Badge className="bg-teal-500/10 text-teal-400 border-0 shrink-0 text-xs">
                  {rubric.chapterId}
                </Badge>

                {/* Symptom text */}
                <span
                  className={`text-sm text-gray-200 truncate min-w-0 flex-1 ${
                    rubric.eliminated ? "line-through" : ""
                  }`}
                  title={rubric.symptomPt}
                >
                  {rubric.symptomPt}
                </span>

                {/* Remedy count */}
                <span className="text-xs text-gray-500 shrink-0">
                  {rubric.remedyCount} rem.
                </span>

                {/* Kent / Algorithmic: weight selector */}
                {(method === "kent" || method === "algorithmic") && (
                  <Select
                    value={rubric.weight ?? "general"}
                    onValueChange={(v) =>
                      setRubricWeight(
                        rubric.id,
                        (v ?? "general") as "mental" | "general" | "particular"
                      )
                    }
                  >
                    <SelectTrigger className="w-[100px] h-7 text-xs bg-transparent border-white/10 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-white/10">
                      {Object.entries(WEIGHT_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Boenninghausen / Algorithmic: category selector */}
                {(method === "boenninghausen" || method === "algorithmic") && (
                  <Select
                    value={rubric.category ?? "location"}
                    onValueChange={(v) =>
                      setRubricCategory(
                        rubric.id,
                        (v ?? "location") as
                          | "location"
                          | "sensation"
                          | "modality"
                          | "concomitant"
                      )
                    }
                  >
                    <SelectTrigger className="w-[120px] h-7 text-xs bg-transparent border-white/10 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-white/10">
                      {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Intensity dots (all methods) */}
                <IntensityDots
                  value={rubric.intensity ?? 1}
                  onChange={(v) => setRubricIntensity(rubric.id, v)}
                />

                {/* Elimination toggle */}
                <button
                  onClick={() => toggleElimination(rubric.id)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors shrink-0 ${
                    rubric.eliminated
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                  }`}
                  title={
                    rubric.eliminated
                      ? "Remover eliminação"
                      : "Eliminar rubrica"
                  }
                >
                  Elim.
                </button>

                {/* Remove button */}
                <button
                  onClick={() => removeRubric(rubric.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10"
                  title="Remover rubrica"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
          <Button
            onClick={handleRepertorize}
            disabled={selectedRubrics.length < 1 || loading}
            className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Repertorizando...
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4 mr-1.5" />
                Repertorizar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={selectedRubrics.length === 0}
            className="border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Limpar
          </Button>
          {hasRun && results.length > 0 && (
            <span className="text-xs text-gray-500 ml-auto">
              {METHOD_LABELS[method]} &mdash; {results.length} rem&eacute;dios
              encontrados
            </span>
          )}
        </div>
      </Card>

      {/* ===== Grid Matrix ===== */}
      {hasRun && gridRemedies.length > 0 && (
        <Card className="bg-[#111118] border-white/10 p-4 overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Matriz de Repertoriza&ccedil;&atilde;o
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[600px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#111118] border border-white/5 px-2 py-1 text-left text-gray-400 font-medium min-w-[200px]">
                    Rubrica
                  </th>
                  {gridRemedies.map((remedy) => (
                    <th
                      key={remedy.name}
                      className="border border-white/5 px-1 py-1 text-center w-12 relative"
                    >
                      <Link
                        href={`/repertory/remedies/${encodeURIComponent(remedy.name)}`}
                        className={`block hover:text-teal-400 transition-colors ${
                          remedy.eliminated
                            ? "opacity-30 line-through text-gray-500"
                            : "text-gray-300"
                        }`}
                        title={remedy.name}
                      >
                        <span
                          className="writing-mode-vertical inline-block font-mono text-[10px] leading-tight"
                          style={{
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            maxHeight: "80px",
                          }}
                        >
                          {remedy.name}
                        </span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRubrics.map((rubric) => {
                  const rubricGrades = gradeMap.get(rubric.id);
                  return (
                    <tr
                      key={rubric.id}
                      className={`${
                        rubric.eliminated ? "opacity-30" : ""
                      } hover:bg-white/[0.02]`}
                    >
                      <td
                        className="sticky left-0 z-10 bg-[#111118] border border-white/5 px-2 py-1 text-gray-300 truncate max-w-[200px]"
                        title={rubric.symptomPt}
                      >
                        <span className="text-teal-500/60 mr-1.5 text-[10px]">
                          {rubric.chapterId}
                        </span>
                        {rubric.symptomPt.length > 45
                          ? rubric.symptomPt.slice(0, 45) + "..."
                          : rubric.symptomPt}
                      </td>
                      {gridRemedies.map((remedy) => (
                        <GradeCell
                          key={remedy.name}
                          grade={rubricGrades?.get(remedy.name)}
                        />
                      ))}
                    </tr>
                  );
                })}

                {/* Total row */}
                <tr className="border-t-2 border-teal-500/30">
                  <td className="sticky left-0 z-10 bg-[#111118] border border-white/5 px-2 py-1.5 text-gray-200 font-semibold text-xs">
                    TOTAL
                  </td>
                  {gridRemedies.map((remedy) => (
                    <td
                      key={remedy.name}
                      className={`border border-white/5 px-1 py-1.5 text-center font-bold text-xs ${
                        remedy.eliminated
                          ? "text-gray-600"
                          : "text-teal-400"
                      }`}
                    >
                      {remedy.total}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===== Bar Ranking ===== */}
      {hasRun && (
        <Card className="bg-[#111118] border-white/10 p-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Ranking &mdash; Top {activeResults.length} Rem&eacute;dios
          </h2>

          {results.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum resultado encontrado.
            </p>
          ) : (
            <div className="space-y-1.5">
              {/* Active remedies */}
              {activeResults.map((remedy, index) => {
                const barWidth = (remedy.total / maxScore) * 100;
                return (
                  <div
                    key={`${remedy.name}-${index}`}
                    className="flex items-center gap-2"
                  >
                    {/* Rank */}
                    <span className="text-xs text-gray-500 w-7 text-right shrink-0 tabular-nums">
                      {index + 1}.
                    </span>

                    {/* Remedy name */}
                    <span className="text-sm text-gray-200 w-28 shrink-0 font-mono truncate">
                      {remedy.name}
                    </span>

                    {/* Bar */}
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

                    {/* Coverage */}
                    <span className="text-xs text-gray-500 w-20 text-right shrink-0 tabular-nums">
                      {remedy.count}/{rubricCount} rubr.
                    </span>

                    {/* Link to remedy */}
                    <Link
                      href={`/repertory/remedies/${encodeURIComponent(remedy.name)}`}
                      className="text-gray-500 hover:text-teal-400 transition-colors shrink-0"
                      title={`Ver ${remedy.name}`}
                    >
                      <Pill className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}

              {/* Eliminated remedies */}
              {eliminatedResults.length > 0 && (
                <>
                  <div className="border-t border-white/5 my-3 pt-3">
                    <span className="text-xs text-gray-600 uppercase tracking-wider">
                      Eliminados ({eliminatedResults.length})
                    </span>
                  </div>
                  {eliminatedResults.map((remedy, index) => {
                    const barWidth = maxScore > 0 ? (remedy.total / maxScore) * 100 : 0;
                    return (
                      <div
                        key={`elim-${remedy.name}-${index}`}
                        className="flex items-center gap-2 opacity-30"
                      >
                        <span className="text-xs text-gray-600 w-7 text-right shrink-0 tabular-nums">
                          &mdash;
                        </span>
                        <span className="text-sm text-gray-500 w-28 shrink-0 font-mono truncate line-through">
                          {remedy.name}
                        </span>
                        <div className="flex-1 h-7 bg-white/5 rounded overflow-hidden relative">
                          <div
                            className="h-full rounded bg-gradient-to-r from-gray-700 to-gray-600 transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                          <div className="absolute inset-0 flex items-center px-2 justify-end">
                            <span className="text-xs text-gray-600 font-medium tabular-nums">
                              {remedy.total} pts
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 w-20 text-right shrink-0 tabular-nums">
                          {remedy.count}/{rubricCount} rubr.
                        </span>
                        <Link
                          href={`/repertory/remedies/${encodeURIComponent(remedy.name)}`}
                          className="text-gray-600 hover:text-teal-400 transition-colors shrink-0"
                          title={`Ver ${remedy.name}`}
                        >
                          <Pill className="w-4 h-4" />
                        </Link>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
