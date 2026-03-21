import { describe, it, expect } from "vitest";
import {
  parseRemedies,
  repertorize,
  repertorizeLegacy,
  escapeILike,
  normalizeSearchTerm,
  type WeightedRubric,
} from "../repertory";

// ========== parseRemedies ==========

describe("parseRemedies", () => {
  it("parses UPPERCASE as grade 3", () => {
    const result = parseRemedies("SULPH PULS NUX-V");
    expect(result).toEqual([
      { name: "SULPH", grade: 3 },
      { name: "PULS", grade: 3 },
      { name: "NUX-V", grade: 3 },
    ]);
  });

  it("parses Capitalized as grade 2", () => {
    const result = parseRemedies("Sulph Puls Nux-v");
    expect(result).toEqual([
      { name: "Sulph", grade: 2 },
      { name: "Puls", grade: 2 },
      { name: "Nux-v", grade: 2 },
    ]);
  });

  it("parses lowercase as grade 1", () => {
    const result = parseRemedies("sulph puls nux-v");
    expect(result).toEqual([
      { name: "sulph", grade: 1 },
      { name: "puls", grade: 1 },
      { name: "nux-v", grade: 1 },
    ]);
  });

  it("handles mixed grades", () => {
    const result = parseRemedies("SULPH Puls nux-v");
    expect(result).toHaveLength(3);
    expect(result[0].grade).toBe(3);
    expect(result[1].grade).toBe(2);
    expect(result[2].grade).toBe(1);
  });

  it("returns empty array for empty/null input", () => {
    expect(parseRemedies("")).toEqual([]);
    expect(parseRemedies("   ")).toEqual([]);
    expect(parseRemedies(null as unknown as string)).toEqual([]);
    expect(parseRemedies(undefined as unknown as string)).toEqual([]);
  });

  it("handles single-character remedies as grade 1", () => {
    // Single char uppercase: name.length is 1, so NOT grade 3
    const result = parseRemedies("A b C");
    expect(result[0].grade).toBe(1); // A -> single char
    expect(result[1].grade).toBe(1); // b -> lowercase
    expect(result[2].grade).toBe(1); // C -> single char
  });

  it("handles extra whitespace", () => {
    const result = parseRemedies("  SULPH   Puls    nux-v  ");
    expect(result).toHaveLength(3);
  });
});

// ========== repertorize ==========

describe("repertorize", () => {
  const rubrics: WeightedRubric[] = [
    { id: 1, remedies: "SULPH Puls nux-v arn" },
    { id: 2, remedies: "SULPH PULS arn lyc" },
    { id: 3, remedies: "Sulph Puls NUX-V lyc" },
  ];

  describe("sum method", () => {
    it("scores by sum of grades", () => {
      const results = repertorize(rubrics, "sum");
      // SULPH: 3+3+2 = 8, PULS: 2+3+2 = 7, etc.
      expect(results[0].name).toBe("SULPH");
      expect(results[0].total).toBe(8);
      expect(results[0].count).toBe(3);
    });

    it("respects topN limit", () => {
      const results = repertorize(rubrics, "sum", 2);
      expect(results).toHaveLength(2);
    });
  });

  describe("coverage method", () => {
    it("sorts by count first, then total", () => {
      const results = repertorize(rubrics, "coverage");
      // SULPH: count=3, PULS: count=3
      expect(results[0].count).toBe(3);
      expect(results[1].count).toBe(3);
      // Remedies with count=2 should come after count=3
      const coverageTwos = results.filter((r) => r.count === 2);
      const coverageThrees = results.filter((r) => r.count === 3);
      const firstTwoIdx = results.indexOf(coverageTwos[0]);
      const lastThreeIdx = results.indexOf(coverageThrees[coverageThrees.length - 1]);
      expect(firstTwoIdx).toBeGreaterThan(lastThreeIdx);
    });
  });

  describe("kent method", () => {
    it("applies mental weight 10x", () => {
      const kentRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH Puls", weight: "mental" },
        { id: 2, remedies: "SULPH nux-v", weight: "general" },
        { id: 3, remedies: "Puls nux-v", weight: "particular" },
      ];
      const results = repertorize(kentRubrics, "kent");
      // SULPH: grade3*10 + grade3*5 = 45
      // Puls: grade2*10 + grade1*1 = 21
      // nux-v: grade1*5 + grade1*1 = 6
      expect(results[0].name).toBe("SULPH");
      expect(results[0].total).toBe(45);
    });

    it("eliminates remedies not in mental rubrics", () => {
      const kentRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH Puls", weight: "mental" },
        { id: 2, remedies: "nux-v lyc", weight: "particular" },
      ];
      const results = repertorize(kentRubrics, "kent");
      const nuxv = results.find((r) => r.name === "NUX-V");
      expect(nuxv?.eliminated).toBe(true);
    });
  });

  describe("boenninghausen method", () => {
    it("applies category weights", () => {
      const bRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH", category: "concomitant" }, // grade 3 * 3 = 9
        { id: 2, remedies: "SULPH", category: "location" },    // grade 3 * 1 = 3
      ];
      const results = repertorize(bRubrics, "boenninghausen");
      expect(results[0].name).toBe("SULPH");
      expect(results[0].total).toBe(12);
    });
  });

  describe("hahnemann method", () => {
    it("eliminates remedies covering less than 50% with 3+ rubrics", () => {
      const hRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH Puls nux-v" },
        { id: 2, remedies: "SULPH Puls" },
        { id: 3, remedies: "SULPH lyc" },
      ];
      const results = repertorize(hRubrics, "hahnemann");
      // nux-v: count=1, coverage=1/3=33% < 50% -> eliminated
      const nuxv = results.find((r) => r.name === "NUX-V");
      expect(nuxv?.eliminated).toBe(true);
      // SULPH: count=3, coverage=100% -> not eliminated
      const sulph = results.find((r) => r.name === "SULPH");
      expect(sulph?.eliminated).toBe(false);
    });

    it("multiplies score by coverage ratio", () => {
      const hRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH Puls" },
        { id: 2, remedies: "SULPH" },
      ];
      const results = repertorize(hRubrics, "hahnemann");
      // SULPH: (3+3) * (2/2) = 6
      // Puls: (2) * (1/2) = 1
      expect(results[0].name).toBe("SULPH");
      expect(results[0].total).toBe(6);
    });
  });

  describe("algorithmic method", () => {
    it("applies hybrid Kent+Boenninghausen weights", () => {
      const aRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH", weight: "mental", category: "modality" },
      ];
      const results = repertorize(aRubrics, "algorithmic");
      // Max(wMul=8, cMul=2.5) = 8; grade 3 * 8 = 24
      expect(results[0].total).toBe(24);
    });

    it("applies specificity bonus for rare rubrics", () => {
      const aRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH", remedyCount: 5 }, // < 10 remedies -> 1.5x bonus
      ];
      const results = repertorize(aRubrics, "algorithmic");
      // grade 3 * 1 (no weight) * 1 (no category) * 1.5 (specificity) = 4.5
      expect(results[0].total).toBe(4.5);
    });

    it("eliminates remedies covering less than 40% with 3+ rubrics", () => {
      const aRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH Puls nux-v" },
        { id: 2, remedies: "SULPH Puls" },
        { id: 3, remedies: "SULPH lyc" },
      ];
      const results = repertorize(aRubrics, "algorithmic");
      // nux-v: count=1, coverage=1/3=33% < 40% -> eliminated
      const nuxv = results.find((r) => r.name === "NUX-V");
      expect(nuxv?.eliminated).toBe(true);
    });
  });

  describe("eliminatory rubrics", () => {
    it("eliminates remedies not present in all eliminatory rubrics", () => {
      const elimRubrics: WeightedRubric[] = [
        { id: 1, remedies: "SULPH Puls nux-v", eliminated: true },
        { id: 2, remedies: "SULPH Puls lyc", eliminated: true },
        { id: 3, remedies: "SULPH nux-v arn" },
      ];
      const results = repertorize(elimRubrics, "sum");
      // nux-v only in rubric 1, not rubric 2 -> eliminated
      const nuxv = results.find((r) => r.name === "NUX-V");
      expect(nuxv?.eliminated).toBe(true);
      // SULPH in both eliminatory rubrics -> not eliminated
      const sulph = results.find((r) => r.name === "SULPH");
      expect(sulph?.eliminated).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("returns empty array for no rubrics", () => {
      expect(repertorize([], "sum")).toEqual([]);
    });

    it("handles rubric with empty remedies", () => {
      const results = repertorize([{ id: 1, remedies: "" }], "sum");
      expect(results).toEqual([]);
    });

    it("handles single rubric", () => {
      const results = repertorize(
        [{ id: 1, remedies: "SULPH Puls" }],
        "sum"
      );
      expect(results).toHaveLength(2);
    });
  });
});

// ========== repertorizeLegacy ==========

describe("repertorizeLegacy", () => {
  it("wraps rubrics and uses sum method", () => {
    const results = repertorizeLegacy(
      [{ remedies: "SULPH Puls" }, { remedies: "SULPH nux-v" }],
      30
    );
    expect(results[0].name).toBe("SULPH");
    expect(results[0].count).toBe(2);
  });
});

// ========== escapeILike ==========

describe("escapeILike", () => {
  it("escapes % character", () => {
    expect(escapeILike("100%")).toBe("100\\%");
  });

  it("escapes _ character", () => {
    expect(escapeILike("field_name")).toBe("field\\_name");
  });

  it("escapes backslash", () => {
    expect(escapeILike("path\\file")).toBe("path\\\\file");
  });

  it("returns unmodified string when no special chars", () => {
    expect(escapeILike("normal text")).toBe("normal text");
  });
});

// ========== normalizeSearchTerm ==========

describe("normalizeSearchTerm", () => {
  it("wraps words with % wildcards", () => {
    expect(normalizeSearchTerm("head pain")).toBe("%head%pain%");
  });

  it("handles single word", () => {
    expect(normalizeSearchTerm("headache")).toBe("%headache%");
  });

  it("trims and collapses whitespace", () => {
    expect(normalizeSearchTerm("  head   pain  ")).toBe("%head%pain%");
  });

  it("escapes ILIKE special characters in search terms", () => {
    expect(normalizeSearchTerm("100% pain")).toBe("%100\\%%pain%");
  });
});
