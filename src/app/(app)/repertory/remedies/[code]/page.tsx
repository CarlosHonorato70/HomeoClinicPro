"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pill,
  BookOpen,
  List,
  GitBranch,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// --- Types ---

interface Remedy {
  id: number;
  code: string;
  name: string;
  synonym: string | null;
}

interface Correlate {
  id: number;
  term: string;
  relatedTerm: string;
  type: string;
}

interface MateriaMedicaEntry {
  id: number;
  remedyCode: string;
  remedyName: string;
  source: string;
  content: string;
  sections: string | null;
}

interface ParsedSection {
  title: string;
  content: string;
}

interface RubricWithGrade {
  id: number;
  chapterId: string;
  symptomPt: string;
  symptomEn: string | null;
  remedyCount: number;
  miasm: string | null;
  remedyGrade: number;
}

// --- Helpers ---

function parseSections(entry: MateriaMedicaEntry): ParsedSection[] {
  if (entry.sections) {
    try {
      const parsed = JSON.parse(entry.sections);
      if (Array.isArray(parsed)) {
        return parsed.map((s: { title?: string; content?: string }) => ({
          title: s.title ?? "Sem título",
          content: s.content ?? "",
        }));
      }
      if (typeof parsed === "object" && parsed !== null) {
        return Object.entries(parsed).map(([title, content]) => ({
          title,
          content: typeof content === "string" ? content : String(content),
        }));
      }
    } catch {
      // Fall through to use full content
    }
  }
  return [];
}

function gradeLabel(grade: number): string {
  if (grade === 3) return "Grau 3";
  if (grade === 2) return "Grau 2";
  if (grade === 1) return "Grau 1";
  return "—";
}

function gradeBadgeClass(grade: number): string {
  if (grade === 3) return "bg-teal-500/20 text-teal-300 font-bold border-0";
  if (grade === 2) return "bg-teal-500/10 text-teal-400 border-0";
  if (grade === 1) return "bg-white/5 text-gray-400 border-0";
  return "bg-white/5 text-gray-500 border-0";
}

// --- Components ---

function CollapsibleSection({ section }: { section: ParsedSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-[#111118] hover:bg-white/5 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-teal-500 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
        )}
        <span className="text-sm font-medium text-gray-200">
          {section.title}
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-[#0d0d14] border-t border-white/5">
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {section.content}
          </p>
        </div>
      )}
    </div>
  );
}

function MateriaMedicaTab({ code }: { code: string }) {
  const [entries, setEntries] = useState<MateriaMedicaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/repertory/remedies/${encodeURIComponent(code)}/materia-medica`
        );
        if (!res.ok) return;
        const data = await res.json();
        setEntries(data.entries ?? []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">Carregando matéria médica...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">
          Nenhuma matéria médica disponível para este remédio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => {
        const sections = parseSections(entry);

        return (
          <div key={entry.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/10 text-gray-300 border-0 text-xs">
                {entry.source}
              </Badge>
            </div>

            {sections.length > 0 ? (
              <div className="space-y-2">
                {sections.map((section, idx) => (
                  <CollapsibleSection key={idx} section={section} />
                ))}
              </div>
            ) : (
              <div className="bg-[#111118] border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RubricsTab({ code }: { code: string }) {
  const [rubrics, setRubrics] = useState<RubricWithGrade[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRubrics = useCallback(
    async (pg: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/repertory/remedies/${encodeURIComponent(code)}/rubrics?page=${pg}&limit=50`
        );
        if (!res.ok) return;
        const data = await res.json();
        setRubrics(data.rubrics ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
      } catch {
        setRubrics([]);
      } finally {
        setLoading(false);
      }
    },
    [code]
  );

  useEffect(() => {
    fetchRubrics(1);
  }, [fetchRubrics]);

  function goToPage(pg: number) {
    setPage(pg);
    fetchRubrics(pg);
  }

  if (loading && rubrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">Carregando rubricas...</p>
      </div>
    );
  }

  if (rubrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">
          Nenhuma rubrica encontrada para este remédio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        {total.toLocaleString("pt-BR")} rubricas contendo este remédio
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-500 uppercase">
              <th className="text-left px-4 py-2 w-28">Capítulo</th>
              <th className="text-left px-4 py-2">Sintoma</th>
              <th className="text-center px-4 py-2 w-24">Grau</th>
              <th className="text-right px-4 py-2 w-24">Remédios</th>
            </tr>
          </thead>
          <tbody>
            {rubrics.map((rubric) => (
              <tr
                key={rubric.id}
                className="bg-[#111118] hover:bg-white/5 border-b border-white/5 transition-colors"
              >
                <td className="px-4 py-2">
                  <Badge className="bg-white/10 text-gray-400 border-0 text-xs font-mono">
                    {rubric.chapterId}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-sm text-gray-200">
                  {rubric.symptomPt}
                </td>
                <td className="px-4 py-2 text-center">
                  <Badge className={gradeBadgeClass(rubric.remedyGrade)}>
                    {gradeLabel(rubric.remedyGrade)}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="text-xs text-gray-500">
                    {rubric.remedyCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-30"
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-30"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

function CorrelatesTab({ correlates }: { correlates: Correlate[] }) {
  if (correlates.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">
          Nenhum correlato disponível para este remédio.
        </p>
      </div>
    );
  }

  // Group by type
  const grouped = correlates.reduce<Record<string, Correlate[]>>(
    (acc, correlate) => {
      const key = correlate.type || "Geral";
      if (!acc[key]) acc[key] = [];
      acc[key].push(correlate);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h3 className="text-sm font-medium text-gray-400 mb-2">{type}</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((correlate) => (
              <Link
                key={correlate.id}
                href={`/repertory/remedies/${encodeURIComponent(correlate.relatedTerm)}`}
                className="inline-block"
              >
                <Badge className="bg-white/5 text-gray-300 border border-white/10 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30 transition-all cursor-pointer">
                  {correlate.relatedTerm}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Page ---

export default function RemedyDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [rubricCount, setRubricCount] = useState(0);
  const [correlates, setCorrelates] = useState<Correlate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRemedy() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/repertory/remedies/${encodeURIComponent(code)}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            setError("Remédio não encontrado.");
          } else {
            setError("Erro ao carregar remédio.");
          }
          return;
        }
        const data = await res.json();
        setRemedy(data.remedy);
        setRubricCount(data.rubricCount ?? 0);
        setCorrelates(data.correlates ?? []);
      } catch {
        setError("Erro ao carregar remédio.");
      } finally {
        setLoading(false);
      }
    }
    loadRemedy();
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-gray-500 text-sm">Carregando remédio...</p>
      </div>
    );
  }

  if (error || !remedy) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p className="text-gray-400 text-sm">{error ?? "Remédio não encontrado."}</p>
        <Link
          href="/repertory/remedies"
          className="text-teal-400 hover:text-teal-300 text-sm underline"
        >
          Voltar para lista de remédios
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0f] p-4">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/repertory/remedies"
            className="text-gray-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Pill className="h-5 w-5 text-teal-500" />
          <h1 className="text-xl font-semibold text-gray-100">{remedy.name}</h1>
          <Badge className="bg-teal-500/15 text-teal-400 border-0 font-mono">
            {remedy.code}
          </Badge>
        </div>

        <div className="flex items-center gap-4 pl-8">
          {remedy.synonym && (
            <span className="text-sm text-gray-500">{remedy.synonym}</span>
          )}
          <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
            {rubricCount.toLocaleString("pt-BR")} rubricas
          </Badge>
          {correlates.length > 0 && (
            <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
              {correlates.length} correlatos
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="materia-medica" className="h-full">
          <div className="border-b border-white/10 bg-[#0a0a0f] px-4">
            <TabsList className="bg-transparent gap-0">
              <TabsTrigger
                value="materia-medica"
                className="text-gray-400 data-active:text-teal-400 data-active:bg-transparent rounded-none border-b-2 border-transparent data-active:border-teal-500 px-4 py-2"
              >
                <BookOpen className="h-4 w-4 mr-1.5" />
                Matéria Médica
              </TabsTrigger>
              <TabsTrigger
                value="rubrics"
                className="text-gray-400 data-active:text-teal-400 data-active:bg-transparent rounded-none border-b-2 border-transparent data-active:border-teal-500 px-4 py-2"
              >
                <List className="h-4 w-4 mr-1.5" />
                Rubricas
              </TabsTrigger>
              <TabsTrigger
                value="correlates"
                className="text-gray-400 data-active:text-teal-400 data-active:bg-transparent rounded-none border-b-2 border-transparent data-active:border-teal-500 px-4 py-2"
              >
                <GitBranch className="h-4 w-4 mr-1.5" />
                Correlatos
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="materia-medica">
              <MateriaMedicaTab code={code} />
            </TabsContent>

            <TabsContent value="rubrics">
              <RubricsTab code={code} />
            </TabsContent>

            <TabsContent value="correlates">
              <CorrelatesTab correlates={correlates} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
