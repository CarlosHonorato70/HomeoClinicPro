// ========== Types ==========

export interface ParsedRemedy {
  name: string;
  grade: 1 | 2 | 3;
}

export type RepertorizationMethod = "sum" | "coverage" | "kent" | "boenninghausen" | "hahnemann" | "algorithmic";
export type RubricWeight = "mental" | "general" | "particular";
export type RubricCategory = "location" | "sensation" | "modality" | "concomitant";

export interface WeightedRubric {
  id: number;
  remedies: string;
  remedyCount?: number;
  weight?: RubricWeight;
  category?: RubricCategory;
  intensity?: 1 | 2 | 3;
  eliminated?: boolean;
}

export interface RubricDetail {
  rubricId: number;
  grade: number;
}

export interface ScoredRemedy {
  name: string;
  total: number;
  count: number;
  maxGrade: number;
  rubricDetails: RubricDetail[];
  eliminated?: boolean;
}

// ========== Remedy Parser ==========

/**
 * Parses a space-separated remedy string using the standard grading convention:
 * - UPPERCASE (len > 1) = grade 3 (highest)
 * - Capitalized (first letter upper) = grade 2
 * - lowercase = grade 1
 */
export function parseRemedies(remedyString: string): ParsedRemedy[] {
  if (!remedyString?.trim()) return [];

  return remedyString
    .trim()
    .split(/\s+/)
    .filter((name) => name.length > 0)
    .map((name) => ({
      name,
      grade:
        name === name.toUpperCase() && name.length > 1
          ? 3
          : name[0] === name[0].toUpperCase() && name.length > 1
            ? 2
            : (1 as 1 | 2 | 3),
    }));
}

// ========== Weight Multipliers ==========

const KENT_WEIGHTS: Record<RubricWeight, number> = {
  mental: 10,
  general: 5,
  particular: 1,
};

const BOENNINGHAUSEN_WEIGHTS: Record<RubricCategory, number> = {
  location: 1,
  sensation: 1.5,
  modality: 2,
  concomitant: 3,
};

const ALGORITHMIC_KENT_WEIGHTS: Record<RubricWeight, number> = {
  mental: 8,
  general: 4,
  particular: 2,
};

const ALGORITHMIC_CATEGORY_WEIGHTS: Record<RubricCategory, number> = {
  location: 1,
  sensation: 1.5,
  modality: 2.5,
  concomitant: 3,
};

// ========== Repertorization Engine ==========

/**
 * Advanced repertorization with multiple methods.
 */
export function repertorize(
  rubrics: WeightedRubric[],
  method: RepertorizationMethod = "sum",
  topN: number = 30
): ScoredRemedy[] {
  const scores: Record<
    string,
    { total: number; count: number; maxGrade: number; rubricDetails: RubricDetail[] }
  > = {};

  // Determine which rubrics are marked as eliminatory
  const eliminatingIds = new Set(
    rubrics.filter((r) => r.eliminated).map((r) => r.id)
  );

  // For Kent: check if there are any mental rubrics
  const hasMentals =
    method === "kent" && rubrics.some((r) => r.weight === "mental");

  const mentalRubricIds = new Set(
    rubrics.filter((r) => r.weight === "mental").map((r) => r.id)
  );

  for (const rubric of rubrics) {
    const remedies = parseRemedies(rubric.remedies);
    const intensity = rubric.intensity ?? 1;

    // Calculate weight multiplier based on method
    let multiplier = 1;
    if (method === "kent" && rubric.weight) {
      multiplier = KENT_WEIGHTS[rubric.weight] ?? 1;
    } else if (method === "boenninghausen" && rubric.category) {
      multiplier = BOENNINGHAUSEN_WEIGHTS[rubric.category] ?? 1;
    } else if (method === "algorithmic") {
      // Hybrid: combine Kent weight + Boenninghausen category
      const wMul = rubric.weight ? (ALGORITHMIC_KENT_WEIGHTS[rubric.weight] ?? 1) : 1;
      const cMul = rubric.category ? (ALGORITHMIC_CATEGORY_WEIGHTS[rubric.category] ?? 1) : 1;
      multiplier = Math.max(wMul, cMul);
    }
    // Hahnemann: multiplier stays 1 (equal weight for all symptoms)

    // Specificity bonus for algorithmic method: rubrics with fewer remedies are more specific
    const specificityBonus = (method === "algorithmic" && rubric.remedyCount && rubric.remedyCount < 10) ? 1.5 : 1;

    for (const r of remedies) {
      const key = r.name.toUpperCase();
      if (!scores[key]) {
        scores[key] = { total: 0, count: 0, maxGrade: 0, rubricDetails: [] };
      }

      const weightedScore = r.grade * multiplier * intensity * specificityBonus;
      scores[key].total += weightedScore;
      scores[key].count += 1;
      scores[key].rubricDetails.push({ rubricId: rubric.id, grade: r.grade });

      if (r.grade > scores[key].maxGrade) {
        scores[key].maxGrade = r.grade;
      }
    }
  }

  // Build result array
  let results = Object.entries(scores).map(([name, data]) => {
    // Check elimination: remedy must appear in ALL eliminatory rubrics
    let eliminated = false;

    if (eliminatingIds.size > 0) {
      const coveredEliminatingIds = new Set(
        data.rubricDetails
          .filter((d) => eliminatingIds.has(d.rubricId))
          .map((d) => d.rubricId)
      );
      if (coveredEliminatingIds.size < eliminatingIds.size) {
        eliminated = true;
      }
    }

    // Kent: eliminate if doesn't cover mental rubrics
    if (method === "kent" && hasMentals) {
      const coversMentals = data.rubricDetails.some((d) =>
        mentalRubricIds.has(d.rubricId)
      );
      if (!coversMentals) {
        eliminated = true;
      }
    }

    // Hahnemann: eliminate remedies covering less than 50% of rubrics
    if (method === "hahnemann" && rubrics.length >= 3) {
      const coverage = data.count / rubrics.length;
      if (coverage < 0.5) {
        eliminated = true;
      }
    }

    // Algorithmic: eliminate remedies covering less than 40% of rubrics
    if (method === "algorithmic" && rubrics.length >= 3) {
      const coverage = data.count / rubrics.length;
      if (coverage < 0.4) {
        eliminated = true;
      }
    }

    // Hahnemann: multiply score by coverage ratio to favor totalidade
    let finalTotal = data.total;
    if (method === "hahnemann") {
      const coverageRatio = data.count / rubrics.length;
      finalTotal = data.total * coverageRatio;
    }

    return { name, ...data, total: Math.round(finalTotal * 100) / 100, eliminated };
  });

  // Sort based on method
  if (method === "coverage") {
    results.sort(
      (a, b) =>
        (a.eliminated ? 1 : 0) - (b.eliminated ? 1 : 0) ||
        b.count - a.count ||
        b.total - a.total
    );
  } else {
    results.sort(
      (a, b) =>
        (a.eliminated ? 1 : 0) - (b.eliminated ? 1 : 0) ||
        b.total - a.total ||
        b.count - a.count
    );
  }

  return results.slice(0, topN);
}

// ========== Legacy wrapper for backward compatibility ==========

export function repertorizeLegacy(
  rubrics: { remedies: string }[],
  topN: number = 30
): ScoredRemedy[] {
  const weighted: WeightedRubric[] = rubrics.map((r, i) => ({
    id: i,
    remedies: r.remedies,
  }));
  return repertorize(weighted, "sum", topN);
}

// ========== Search utilities ==========

/**
 * Escape ILIKE special characters to prevent wildcard injection.
 */
function escapeILike(str: string): string {
  return str.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}

/**
 * Normalize search term for PostgreSQL ILIKE queries.
 * Escapes wildcards from user input to prevent injection.
 */
export function normalizeSearchTerm(term: string): string {
  const words = term
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map(escapeILike);
  return `%${words.join("%")}%`;
}
