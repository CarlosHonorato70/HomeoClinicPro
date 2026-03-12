"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRepertorization } from "@/contexts/repertorization-context";

interface Chapter {
  id: string;
  code: string;
  name: string;
  rubricCount: number;
}

interface Rubric {
  id: number;
  symptomPt: string;
  symptomEn: string;
  remedyCount: number;
  chapterId: string;
  miasm: string | null;
}

interface ParsedRemedy {
  name: string;
  grade: number;
}

export default function RepertoryPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedRubricId, setExpandedRubricId] = useState<number | null>(null);
  const [expandedRemedies, setExpandedRemedies] = useState<ParsedRemedy[]>([]);
  const [loadingRemedies, setLoadingRemedies] = useState(false);

  const { addRubric, removeRubric, isSelected, selectedRubrics } =
    useRepertorization();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch chapters on mount
  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch("/api/repertory/chapters");
        if (!res.ok) return;
        const data = await res.json();
        setChapters(data.chapters ?? data ?? []);
      } catch {
        /* ignore */
      }
    }
    fetchChapters();
  }, []);

  // Fetch rubrics when chapter or page changes (not during search)
  useEffect(() => {
    if (searchQuery) return;
    if (!selectedChapter) {
      setRubrics([]);
      setTotalPages(1);
      return;
    }

    async function fetchRubrics() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/repertory/chapters/${selectedChapter}/rubrics?page=${page}&limit=50`
        );
        if (!res.ok) return;
        const data = await res.json();
        setRubrics(data.rubrics ?? data.data ?? []);
        setTotalPages(data.totalPages ?? data.pagination?.totalPages ?? 1);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchRubrics();
  }, [selectedChapter, page, searchQuery]);

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!value.trim()) {
        setPage(1);
        return;
      }

      debounceTimer.current = setTimeout(async () => {
        setLoading(true);
        setSelectedChapter(null);
        try {
          const res = await fetch(
            `/api/repertory/search?q=${encodeURIComponent(value.trim())}&page=1&limit=50`
          );
          if (!res.ok) return;
          const data = await res.json();
          setRubrics(data.rubrics ?? data.data ?? []);
          setTotalPages(data.totalPages ?? data.pagination?.totalPages ?? 1);
          setPage(1);
        } catch {
          /* ignore */
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  // Expand rubric to show remedies
  async function toggleExpand(rubric: Rubric) {
    if (expandedRubricId === rubric.id) {
      setExpandedRubricId(null);
      setExpandedRemedies([]);
      return;
    }

    setExpandedRubricId(rubric.id);
    setLoadingRemedies(true);
    try {
      const res = await fetch(`/api/repertory/rubrics/${rubric.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setExpandedRemedies(data.parsedRemedies ?? []);
    } catch {
      setExpandedRemedies([]);
    } finally {
      setLoadingRemedies(false);
    }
  }

  function handleChapterClick(chapterId: string) {
    setSelectedChapter(chapterId);
    setSearchQuery("");
    setPage(1);
    setExpandedRubricId(null);
    setExpandedRemedies([]);
  }

  function handleToggleRubric(rubric: Rubric) {
    if (isSelected(rubric.id)) {
      removeRubric(rubric.id);
    } else {
      addRubric({
        id: rubric.id,
        symptomPt: rubric.symptomPt,
        chapterId: rubric.chapterId,
        remedyCount: rubric.remedyCount,
      });
    }
  }

  function getRemedyBadgeClass(grade: number): string {
    if (grade === 3) return "bg-teal-500/20 text-teal-300 font-bold border-0";
    if (grade === 2) return "bg-teal-500/10 text-teal-400 border-0";
    return "bg-white/5 text-gray-400 border-0";
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar - Chapters */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0a0a0f] overflow-y-auto">
        <div className="p-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Capítulos
          </h2>
        </div>
        <nav className="py-1">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterClick(chapter.id)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                selectedChapter === chapter.id
                  ? "bg-teal-500/10 text-teal-400 border-l-2 border-teal-400"
                  : "text-gray-300 hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <span className="truncate pr-2">{chapter.name}</span>
              <span className="bg-white/10 text-xs rounded-full px-2 py-0.5 text-gray-400 shrink-0">
                {chapter.rubricCount}
              </span>
            </button>
          ))}
          {chapters.length === 0 && (
            <p className="text-gray-500 text-sm px-3 py-4 text-center">
              Carregando capítulos...
            </p>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-white/10 bg-[#0a0a0f]">
          <Input
            placeholder="Pesquisar rubricas... (ex: cefaleia, febre, ansiedade)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-[#111118] border-white/10 text-gray-200 placeholder:text-gray-500 focus-visible:ring-teal-500/50"
          />
        </div>

        {/* Rubric list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-500 text-sm">Carregando...</div>
            </div>
          ) : rubrics.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? "Nenhuma rubrica encontrada."
                  : selectedChapter
                    ? "Nenhuma rubrica neste capítulo."
                    : "Selecione um capítulo ou pesquise para ver as rubricas."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-500 uppercase">
                  <th className="text-left px-4 py-2 w-8"></th>
                  <th className="text-left px-4 py-2">Sintoma</th>
                  <th className="text-left px-4 py-2 w-28">Capítulo</th>
                  <th className="text-right px-4 py-2 w-24">Remédios</th>
                </tr>
              </thead>
              <tbody>
                {rubrics.map((rubric) => (
                  <Fragment key={rubric.id}>
                    <tr
                      className="bg-[#111118] hover:bg-white/5 border-b border-white/5 cursor-pointer transition-colors"
                      onClick={() => toggleExpand(rubric)}
                    >
                      <td className="px-4 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRubric(rubric);
                          }}
                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center transition-colors ${
                            isSelected(rubric.id)
                              ? "bg-teal-500 text-white"
                              : "bg-white/10 text-gray-400 hover:bg-teal-500/30 hover:text-teal-300"
                          }`}
                          title={
                            isSelected(rubric.id)
                              ? "Remover da repertorização"
                              : "Adicionar à repertorização"
                          }
                        >
                          {isSelected(rubric.id) ? "✓" : "+"}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-200">
                        {rubric.symptomPt}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-500">
                          {rubric.chapterId}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Badge
                          variant="secondary"
                          className="bg-white/10 text-gray-300 border-0"
                        >
                          {rubric.remedyCount}
                        </Badge>
                      </td>
                    </tr>

                    {/* Expanded remedies */}
                    {expandedRubricId === rubric.id && (
                      <tr>
                        <td colSpan={4} className="bg-[#0d0d14] p-4">
                          {loadingRemedies ? (
                            <p className="text-gray-500 text-sm">
                              Carregando remédios...
                            </p>
                          ) : expandedRemedies.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                              Nenhum remédio encontrado.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {expandedRemedies.map((remedy, idx) => (
                                <Badge
                                  key={`${remedy.name}-${idx}`}
                                  className={getRemedyBadgeClass(remedy.grade)}
                                >
                                  {remedy.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {rubrics.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#0a0a0f]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-30"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Floating repertorization badge */}
      {selectedRubrics.length > 0 && (
        <Link
          href="/repertory/repertorize"
          className="fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-colors z-50"
        >
          <span className="text-sm font-medium">Repertorizar</span>
          <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {selectedRubrics.length}
          </span>
        </Link>
      )}
    </div>
  );
}

