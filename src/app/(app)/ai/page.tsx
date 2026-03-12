"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, BookOpen, Pill, Loader2 } from "lucide-react";

interface Rubric {
  id: number;
  chapterId: string;
  symptomPt: string;
  symptomEn: string | null;
  remedies: string;
  remedyCount: number;
  miasm: string | null;
}

export default function AIAssistantPage() {
  const [keywords, setKeywords] = useState("");
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!keywords.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setRubrics(data.rubrics || []);
      } else {
        setRubrics([]);
      }
    } catch {
      setRubrics([]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-teal-400" />
          Assistente IA
        </h1>
        <p className="text-gray-400 mt-1">
          Busque sintomas e receba sugestões de rubricas do repertório
          homeopático
        </p>
      </div>

      {/* Search */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sintomas separados por espaço (ex: cefaleia insonia ansiedade)"
                className="pl-10 bg-[#0a0a0f] border-[#1e1e2e]"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !keywords.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Sugerir Rubricas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <span className="ml-3 text-gray-400">Buscando rubricas...</span>
        </div>
      )}

      {!loading && searched && rubrics.length === 0 && (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              Nenhuma rubrica encontrada para esses termos.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Tente usar termos diferentes ou mais específicos.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && rubrics.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            {rubrics.length} rubrica{rubrics.length !== 1 ? "s" : ""}{" "}
            encontrada{rubrics.length !== 1 ? "s" : ""}
          </p>
          {rubrics.map((rubric) => (
            <Card
              key={rubric.id}
              className="bg-[#111118] border-[#1e1e2e] hover:border-teal-500/30 transition-colors"
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-medium">
                      {rubric.symptomPt}
                    </p>
                    {rubric.symptomEn && (
                      <p className="text-gray-500 text-sm mt-1">
                        {rubric.symptomEn}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-teal-500/30 text-teal-400"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Cap. {rubric.chapterId}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-400"
                      >
                        <Pill className="h-3 w-3 mr-1" />
                        {rubric.remedyCount} remédio
                        {rubric.remedyCount !== 1 ? "s" : ""}
                      </Badge>
                      {rubric.miasm && (
                        <Badge
                          variant="outline"
                          className="text-xs border-purple-500/30 text-purple-400"
                        >
                          {rubric.miasm}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                    onClick={() => {
                      window.location.href = `/repertory/repertorize?rubricId=${rubric.id}`;
                    }}
                  >
                    Adicionar à Repertorização
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
