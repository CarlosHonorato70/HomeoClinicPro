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

// Known remedy codes for matching
let remedyCodeSet: Set<string>;

function normalizeCode(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/[.,;:()[\]]/g, "")
    .replace(/\s+/g, "-")
    .toUpperCase();
  if (cleaned.length < 2 || cleaned.length > 20) return null;
  if (/^\d+$/.test(cleaned)) return null; // pure numbers
  // Direct match
  if (remedyCodeSet.has(cleaned)) return cleaned;
  // Try common abbreviation patterns
  const short = cleaned.replace(/-/g, "");
  for (const code of remedyCodeSet) {
    if (code === cleaned || code === short) return code;
    if (code.replace(/-/g, "") === short) return code;
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

  // Load all remedy codes
  const remedies = await prisma.remedy.findMany({ select: { code: true } });
  remedyCodeSet = new Set(remedies.map((r) => r.code));
  console.log(`Loaded ${remedyCodeSet.size} remedy codes\n`);

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
    // Extract "Relationship" section
    const relMatch = entry.content.match(
      /(?:^|\n)#+?\s*Relationship[s]?[\s\S]*?(?=\n#+?\s|\n\n\n|$)/im
    );
    if (!relMatch) {
      // Try inline pattern: "Relationship.--"
      const inlineMatch = entry.content.match(
        /Relationship[s]?\.?\s*[-—]+\s*([\s\S]*?)(?=\n\s*\n|\n#+|$)/im
      );
      if (inlineMatch) {
        const codes = extractRemedyCodes(inlineMatch[1]);
        for (const code of codes) {
          if (code !== entry.remedyCode) {
            correlates.push({
              term: entry.remedyCode,
              relatedTerm: code,
              type: classifyRelationship("", inlineMatch[1]),
            });
          }
        }
      }
      continue;
    }

    const section = relMatch[0];

    // Parse sub-sections: Compare, Complementary, Antidotes, Inimical, Follows well
    const subSections = section.split(/\n(?=[A-Z])/);
    for (const sub of subSections) {
      const relType = classifyRelationship(sub, "");
      const codes = extractRemedyCodes(sub);
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
