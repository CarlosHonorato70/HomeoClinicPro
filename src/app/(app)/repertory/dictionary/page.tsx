"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookA, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DictEntry {
  id: number;
  term: string;
  definition: string;
}

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (query.trim().length >= 2) params.set("q", query.trim());
      const res = await fetch(`/api/repertory/dictionary?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookA className="h-6 w-6 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Dicionário Médico
            </h1>
            <p className="text-sm text-gray-400">
              {total} termos disponíveis
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar termo ou definição... (minimo 2 caracteres)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-[#111118] border-white/10 text-gray-200"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Carregando...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          {query.length >= 2
            ? "Nenhum resultado encontrado"
            : "Digite pelo menos 2 caracteres para buscar, ou navegue pelos termos abaixo"}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="bg-[#111118] border-[#1e1e2e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-teal-400">
                  {entry.term}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.definition}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-white/10 text-gray-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm text-gray-400">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-white/10 text-gray-300"
          >
            Próxima <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
