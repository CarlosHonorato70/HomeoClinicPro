"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookMarked,
  Plus,
  Search,
  Star,
  Pill,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ClinicalCase {
  id: string;
  title: string;
  summary: string;
  prescribedRemedy: string | null;
  potency: string | null;
  outcomeRating: number | null;
  tags: string | null;
  patientAge: number | null;
  patientSex: string | null;
  createdAt: string;
  createdBy: { name: string };
}

export default function ClinicalCasesPage() {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/clinical-cases?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCases(data.cases);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchCases();
  }

  function renderStars(rating: number | null) {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-teal-400" />
          Casos Clinicos
        </h1>
        <Link href="/clinical-cases/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" /> Novo Caso
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, remedio, tags..."
            className="pl-10 bg-[#111118] border-[#1e1e2e]"
          />
        </div>
        <Button type="submit" variant="outline" className="border-[#1e1e2e]">
          Buscar
        </Button>
      </form>

      <p className="text-sm text-gray-500">{total} caso(s) encontrado(s)</p>

      {/* Cases List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-[#111118] border-[#1e1e2e] animate-pulse">
              <CardContent className="pt-6"><div className="h-20 bg-[#1e1e2e] rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="py-12 text-center">
            <BookMarked className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum caso clinico registrado.</p>
            <Link href="/clinical-cases/new" className="text-teal-400 hover:underline text-sm mt-2 block">
              Criar o primeiro caso
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/clinical-cases/${c.id}`}>
              <Card className="bg-[#111118] border-[#1e1e2e] hover:border-teal-500/30 transition-colors cursor-pointer mb-3">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-200 truncate">{c.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{c.summary}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {c.prescribedRemedy && (
                          <Badge variant="outline" className="border-teal-500/30 text-teal-400 text-xs">
                            <Pill className="h-3 w-3 mr-1" />
                            {c.prescribedRemedy} {c.potency || ""}
                          </Badge>
                        )}
                        {c.patientAge && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {c.patientAge} anos, {c.patientSex === "M" ? "Masc" : "Fem"}
                          </span>
                        )}
                        {c.tags && c.tags.split(",").map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-[#1e1e2e] text-gray-400">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      {renderStars(c.outcomeRating)}
                      <p className="text-xs text-gray-600">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-gray-600">{c.createdBy.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="border-[#1e1e2e]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400">
            {page} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="border-[#1e1e2e]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
