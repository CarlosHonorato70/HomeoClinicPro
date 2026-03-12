"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { RubricWeight, RubricCategory } from "@/lib/repertory";

export interface SelectedRubric {
  id: number;
  symptomPt: string;
  chapterId: string;
  remedyCount: number;
  weight?: RubricWeight;
  category?: RubricCategory;
  intensity?: 1 | 2 | 3;
  eliminated?: boolean;
}

interface RepertorizationContextType {
  selectedRubrics: SelectedRubric[];
  addRubric: (rubric: SelectedRubric) => void;
  removeRubric: (id: number) => void;
  clearRubrics: () => void;
  isSelected: (id: number) => boolean;
  setRubricWeight: (id: number, weight: RubricWeight) => void;
  setRubricCategory: (id: number, category: RubricCategory) => void;
  setRubricIntensity: (id: number, intensity: 1 | 2 | 3) => void;
  toggleElimination: (id: number) => void;
}

const RepertorizationContext = createContext<RepertorizationContextType | null>(
  null
);

export function RepertorizationProvider({ children }: { children: ReactNode }) {
  const [selectedRubrics, setSelectedRubrics] = useState<SelectedRubric[]>([]);

  const updateRubric = useCallback(
    (id: number, updates: Partial<SelectedRubric>) => {
      setSelectedRubrics((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    []
  );

  return (
    <RepertorizationContext.Provider
      value={{
        selectedRubrics,
        addRubric: (rubric) =>
          setSelectedRubrics((prev) =>
            prev.some((r) => r.id === rubric.id) ? prev : [...prev, rubric]
          ),
        removeRubric: (id) =>
          setSelectedRubrics((prev) => prev.filter((r) => r.id !== id)),
        clearRubrics: () => setSelectedRubrics([]),
        isSelected: (id) => selectedRubrics.some((r) => r.id === id),
        setRubricWeight: (id, weight) => updateRubric(id, { weight }),
        setRubricCategory: (id, category) => updateRubric(id, { category }),
        setRubricIntensity: (id, intensity) => updateRubric(id, { intensity }),
        toggleElimination: (id) =>
          setSelectedRubrics((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, eliminated: !r.eliminated } : r
            )
          ),
      }}
    >
      {children}
    </RepertorizationContext.Provider>
  );
}

export function useRepertorization() {
  const ctx = useContext(RepertorizationContext);
  if (!ctx)
    throw new Error(
      "useRepertorization must be used inside RepertorizationProvider"
    );
  return ctx;
}
