/**
 * Build remedy correlates from materia medica "Relationship" sections.
 * Extracts Compare/Complementary/Antidote/Inimical relationships from
 * Boericke, Allen, and Kent materia medica entries.
 *
 * Usage: npx tsx scripts/build-remedy-correlates.mts
 */

import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Maps various name forms -> canonical remedy code
let nameToCodeMap: Map<string, string>;

function normalizeCode(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/[.,;:()[\]]/g, "")
    .replace(/\s+/g, "-")
    .toUpperCase();
  if (cleaned.length < 2 || cleaned.length > 20) return null;
  if (/^\d+$/.test(cleaned)) return null;

  // Direct match
  if (nameToCodeMap.has(cleaned)) return nameToCodeMap.get(cleaned)!;

  // Try without hyphens
  const noDash = cleaned.replace(/-/g, "");
  if (nameToCodeMap.has(noDash)) return nameToCodeMap.get(noDash)!;

  // Try first 4 chars
  const abbr4 = cleaned.slice(0, 4);
  if (nameToCodeMap.has(abbr4)) return nameToCodeMap.get(abbr4)!;

  // Try first 3 chars
  const abbr3 = cleaned.slice(0, 3);
  if (nameToCodeMap.has(abbr3)) return nameToCodeMap.get(abbr3)!;

  // Fuzzy: startsWith check
  for (const [key, code] of nameToCodeMap) {
    if (key.startsWith(cleaned) || cleaned.startsWith(key)) {
      return code;
    }
  }

  return null;
}

function extractRemedyCodes(text: string): string[] {
  // Split on common delimiters, extract remedy names
  const candidates = text.split(/[,;]\s*|\.\s+|\band\b|\be\b/i);
  const codes: string[] = [];
  for (const candidate of candidates) {
    // Try the first word(s) as a remedy code
    const words = candidate.trim().split(/\s+/);
    // Try progressively longer combinations
    for (let len = Math.min(3, words.length); len >= 1; len--) {
      const attempt = words.slice(0, len).join("-");
      const code = normalizeCode(attempt);
      if (code) {
        codes.push(code);
        break;
      }
    }
  }
  return [...new Set(codes)];
}

type RelType = "Comparar" | "Complementar" | "Antídoto" | "Incompatível" | "Segue bem" | "Relacionado";

function classifyRelationship(sectionText: string, lineText: string): RelType {
  const lower = (sectionText + " " + lineText).toLowerCase();
  if (/complement/i.test(lower)) return "Complementar";
  if (/antidot/i.test(lower)) return "Antídoto";
  if (/inimic|incomp/i.test(lower)) return "Incompatível";
  if (/follows?\s+well|segue\s+bem/i.test(lower)) return "Segue bem";
  if (/compar/i.test(lower)) return "Comparar";
  return "Relacionado";
}

async function main() {
  console.log("=== Build Remedy Correlates ===\n");

  // Load all remedy codes + names for matching
  const remedies = await prisma.remedy.findMany({
    select: { code: true, name: true, synonym: true },
  });
  nameToCodeMap = new Map<string, string>();
  for (const r of remedies) {
    nameToCodeMap.set(r.code.toUpperCase(), r.code);
    nameToCodeMap.set(r.name.toUpperCase(), r.code);
    // Add name without spaces/hyphens
    nameToCodeMap.set(r.name.toUpperCase().replace(/[\s-]+/g, ""), r.code);
    if (r.synonym) {
      for (const syn of r.synonym.split(",")) {
        const s = syn.trim().toUpperCase();
        if (s.length > 1) nameToCodeMap.set(s, r.code);
      }
    }
  }
  console.log(`Loaded ${nameToCodeMap.size} remedy name variants\n`);

  // Fetch all materia medica entries that likely have relationship sections
  const entries = await prisma.materiaMedica.findMany({
    where: {
      source: { in: ["BOERICKE", "ALLEN_KEYNOTES", "KENT"] },
    },
    select: { remedyCode: true, source: true, content: true },
  });

  console.log(`Processing ${entries.length} materia medica entries\n`);

  const correlates: { term: string; relatedTerm: string; type: string }[] = [];

  for (const entry of entries) {
    // Normalize line endings
    const content = entry.content.replace(/\r\n?/g, "\n");

    // Try to extract "Relationship" section — multiple patterns
    let relText: string | null = null;

    // Pattern 1: ## Relationship heading
    const headingMatch = content.match(
      /(?:^|\n)#+?\s*Relationship[s]?[^\n]*\n([\s\S]*?)(?=\n#+?\s|\n\n\n|$)/im
    );
    if (headingMatch) {
      relText = headingMatch[1];
    }

    // Pattern 2: Inline "Relationship.--" or "Relationship--"
    if (!relText) {
      const inlineMatch = content.match(
        /Relationship[s]?\.?\s*[-—]+\s*([\s\S]*?)(?=\s*Dose\.?\s*[-—]|$)/im
      );
      if (inlineMatch) {
        relText = inlineMatch[1];
      }
    }

    if (!relText || relText.trim().length < 5) continue;

    // Split into sub-relations: Complementary:, Compare:, Antidotes:, Inimical:, Follows well:
    const subParts = relText.split(/(?=Complement|Compare|Antidot|Inimic|Incomp|Follows?\s+well)/i);
    for (const sub of subParts) {
      const trimmed = sub.trim();
      if (trimmed.length < 3) continue;
      const relType = classifyRelationship(trimmed, "");
      const codes = extractRemedyCodes(trimmed);
      for (const code of codes) {
        if (code !== entry.remedyCode) {
          correlates.push({
            term: entry.remedyCode,
            relatedTerm: code,
            type: relType,
          });
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = correlates.filter((c) => {
    const key = `${c.term}|${c.relatedTerm}|${c.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Extracted ${unique.length} unique correlate relationships\n`);

  if (unique.length === 0) {
    console.log("No correlates found. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // Clear and insert
  await prisma.remedyCorrelate.deleteMany();
  console.log("Cleared existing correlates");

  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const result = await prisma.remedyCorrelate.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
  }

  console.log(`\n✓ Inserted ${inserted} remedy correlate records`);

  // Stats
  const termCount = new Set(unique.map((c) => c.term)).size;
  console.log(`  Covering ${termCount} remedies`);

  const typeCounts: Record<string, number> = {};
  for (const c of unique) {
    typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
  }
  console.log("  By type:", typeCounts);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
