"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Pill, ArrowLeft } from "lucide-react";

interface Remedy {
  id: number;
  code: string;
  name: string;
  synonym: string | null;
}

export default function RemediesListPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRemedies = useCallback(async (query: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pg),
        limit: "50",
      });
      if (query.trim()) {
        params.set("q", query.trim());
      }
      const res = await fetch(`/api/repertory/remedies?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setRemedies(data.remedies ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRemedies("", 1);
  }, [fetchRemedies]);

  // Handle search with debounce
  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchRemedies(value, 1);
    }, 300);
  }

  // Handle pagination
  function goToPage(pg: number) {
    setPage(pg);
    fetchRemedies(searchQuery, pg);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0f] p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/repertory"
            className="text-gray-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Pill className="h-5 w-5 text-teal-500" />
          <h1 className="text-lg font-semibold text-gray-100">
            Remédios Homeopáticos
          </h1>
          {!loading && (
            <Badge className="bg-teal-500/10 text-teal-400 border-0 ml-2">
              {total.toLocaleString("pt-BR")} remédios
            </Badge>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Pesquisar remédios... (ex: Arnica, Belladonna, Nux vomica)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-[#111118] border-white/10 text-gray-200 placeholder:text-gray-500 focus-visible:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500 text-sm">Carregando remédios...</div>
          </div>
        ) : remedies.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? "Nenhum remédio encontrado para esta pesquisa."
                : "Nenhum remédio cadastrado."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {remedies.map((remedy) => (
              <Link
                key={remedy.id}
                href={`/repertory/remedies/${encodeURIComponent(remedy.code)}`}
                className="group block bg-[#111118] border border-white/10 rounded-lg p-4 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <Badge className="bg-teal-500/15 text-teal-400 border-0 font-mono text-xs shrink-0">
                    {remedy.code}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-teal-300 transition-colors truncate">
                      {remedy.name}
                    </p>
                    {remedy.synonym && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {remedy.synonym}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {remedies.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#0a0a0f]">
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
