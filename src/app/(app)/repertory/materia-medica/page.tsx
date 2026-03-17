"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pill,
  ExternalLink,
} from "lucide-react";

interface MateriaResult {
  id: number;
  remedyCode: string;
  remedyName: string;
  source: string | null;
  preview: string;
}

interface SearchResponse {
  results: MateriaResult[];
  total: number;
  page: number;
  totalPages: number;
  sources: string[];
}

export default function MateriaMedicaPage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(
    async (q: string, src: string, p: number) => {
      if (q.length < 2) return;
      setLoading(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams({ q, page: String(p) });
        if (src) params.set("source", src);
        const res = await fetch(`/api/repertory/materia-medica/search?${params}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          if (json.sources?.length && sources.length === 0) {
            setSources(json.sources);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [sources.length]
  );

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setData(null);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      search(query, source, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, source, search]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    search(query, source, newPage);
  }

  // Load sources on mount
  useEffect(() => {
    fetch("/api/repertory/materia-medica/search?q=a&limit=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.sources) setSources(d.sources);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-teal-400" />
        <h1 className="text-2xl font-bold">Matéria Médica</h1>
      </div>

      {/* Search Bar */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar remédio ou conteúdo na matéria médica..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            {sources.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500 shrink-0" />
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="h-9 rounded-md border border-[#2a2a3a] bg-[#16161f] px-3 text-sm text-gray-300"
                >
                  <option value="">Todas as fontes</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-[#111118] border-[#1e1e2e] animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-[#1e1e2e] rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.results.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">
            {data.total} resultado{data.total !== 1 ? "s" : ""} encontrado{data.total !== 1 ? "s" : ""}
          </p>

          <div className="space-y-3">
            {data.results.map((item) => (
              <Card
                key={item.id}
                className="bg-[#111118] border-[#1e1e2e] hover:border-teal-500/30 transition-colors"
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Pill className="h-4 w-4 text-teal-400 shrink-0" />
                        <h3 className="font-semibold text-white">
                          {item.remedyName}
                        </h3>
                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                          {item.remedyCode}
                        </span>
                        {item.source && (
                          <span className="text-xs text-teal-400/70 bg-teal-400/10 px-2 py-0.5 rounded">
                            {item.source}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                        {item.preview}
                      </p>
                    </div>
                    <Link
                      href={`/repertory/remedies/${item.remedyCode}`}
                      className="shrink-0"
                    >
                      <Button variant="ghost" size="sm" className="text-teal-400">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-gray-400">
                Página {data.page} de {data.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : hasSearched && !loading ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum resultado encontrado para &quot;{query}&quot;</p>
          <p className="text-gray-600 text-sm mt-1">Tente buscar pelo nome do remédio ou um sintoma</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">Pesquise na Matéria Médica</p>
          <p className="text-gray-600 text-sm mt-1">
            Digite o nome de um remédio ou sintoma para buscar nos textos de matéria médica
          </p>
        </div>
      )}
    </div>
  );
}
