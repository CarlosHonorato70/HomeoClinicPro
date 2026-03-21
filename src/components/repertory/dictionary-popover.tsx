"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search } from "lucide-react";

interface DictEntry {
  id: number;
  term: string;
  definition: string;
}

export function DictionarySearch() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/repertory/dictionary?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 300);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold text-sm">Dicionário Médico</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar termo médico..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 h-9 text-sm"
        />
      </div>

      {loading && (
        <div className="text-xs text-muted-foreground">Buscando...</div>
      )}

      {entries.length > 0 && (
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-2 rounded border text-sm hover:bg-accent/30"
              >
                <p className="font-medium text-xs">{entry.term}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">
                  {entry.definition}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {!loading && query.length >= 2 && entries.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum resultado para "{query}"
        </p>
      )}
    </div>
  );
}
