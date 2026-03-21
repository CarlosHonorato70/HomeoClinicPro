"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Leaf, ChevronLeft, ChevronRight } from "lucide-react";

interface Plant {
  id: number;
  name: string;
  scientificName: string | null;
  commonNames: string | null;
  indications: string | null;
  contraindications: string | null;
  preparation: string | null;
  dosage: string | null;
  interactions: string | null;
  notes: string | null;
}

export default function PhytotherapyPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("q", search);
      const res = await fetch(`/api/repertory/phytotherapy?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPlants(data.plants);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(fetchPlants, 300);
    return () => clearTimeout(timer);
  }, [fetchPlants]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Fitoterapia
          </h1>
          <p className="text-muted-foreground text-sm">
            {total} plantas medicinais catalogadas
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, nome científico ou indicação..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plant list */}
        <div className="lg:col-span-1">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2 pr-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))
              ) : plants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma planta encontrada
                </p>
              ) : (
                plants.map((plant) => (
                  <Card
                    key={plant.id}
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedPlant?.id === plant.id ? "border-primary bg-accent/30" : ""
                    }`}
                    onClick={() => setSelectedPlant(plant)}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{plant.name}</p>
                      {plant.scientificName && (
                        <p className="text-xs text-muted-foreground italic">
                          {plant.scientificName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Plant detail */}
        <div className="lg:col-span-2">
          {selectedPlant ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  {selectedPlant.name}
                </CardTitle>
                {selectedPlant.scientificName && (
                  <p className="text-sm text-muted-foreground italic">
                    {selectedPlant.scientificName}
                  </p>
                )}
                {selectedPlant.commonNames && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPlant.commonNames.split(",").map((name, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {name.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-4">
                    {selectedPlant.indications && (
                      <Section title="Indicações" content={selectedPlant.indications} />
                    )}
                    {selectedPlant.contraindications && (
                      <Section title="Contraindicações" content={selectedPlant.contraindications} />
                    )}
                    {selectedPlant.preparation && (
                      <Section title="Preparo" content={selectedPlant.preparation} />
                    )}
                    {selectedPlant.dosage && (
                      <Section title="Posologia" content={selectedPlant.dosage} />
                    )}
                    {selectedPlant.interactions && (
                      <Section title="Interações" content={selectedPlant.interactions} />
                    )}
                    {selectedPlant.notes && (
                      <Section title="Observações" content={selectedPlant.notes} />
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <p className="text-sm">Selecione uma planta para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
    </div>
  );
}
