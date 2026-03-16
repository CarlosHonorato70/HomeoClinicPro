/**
 * Fetch materia medica from public domain web sources:
 * - Boericke (materiamedica.info)
 * - Allen's Keynotes (materiamedica.info)
 * - Kent (materiamedica.info)
 *
 * Caches fetched data locally in data/cache/{source}/
 * Then imports into PostgreSQL via Prisma.
 *
 * Usage: npx tsx scripts/fetch-materia-medica.mts [--source boericke|allen|kent|all] [--import-only]
 */

import { PrismaClient } from "../src/generated/prisma/index.js";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const BASE_URL = "https://www.materiamedica.info/en/materia-medica";

const SOURCES = {
  boericke: {
    author: "william-boericke",
    dbSource: "BOERICKE",
    label: "Boericke's Materia Medica",
  },
  allen: {
    author: "henry-c-allen",
    dbSource: "ALLEN_KEYNOTES",
    label: "Allen's Keynotes",
  },
  kent: {
    author: "james-tyler-kent",
    dbSource: "KENT",
    label: "Kent's Lectures on Materia Medica",
  },
} as const;

type SourceKey = keyof typeof SOURCES;

// Top 200 remedy codes from the database (by rubric count) + common names for URL matching
const REMEDY_CODE_TO_SLUG: Record<string, string[]> = {};

// Rate limiting
const DELAY_MS = 1500;
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ===== Fetch Index =====

async function fetchIndex(source: SourceKey): Promise<string[]> {
  const { author } = SOURCES[source];
  const url = `${BASE_URL}/${author}/index`;
  console.log(`  Fetching index: ${url}`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "HomeoClinicPro/1.0 (educational materia medica research)",
    },
  });
  if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);

  const html = await res.text();

  // Extract remedy slugs from href patterns like /en/materia-medica/author/remedy-slug
  const pattern = new RegExp(
    `/en/materia-medica/${author}/([a-z0-9][a-z0-9-]+)`,
    "g"
  );
  const slugs = new Set<string>();
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const slug = match[1];
    if (slug !== "index" && slug !== "-preface" && !slug.startsWith("-")) {
      slugs.add(slug);
    }
  }

  return [...slugs];
}

// ===== Fetch Remedy Page =====

async function fetchRemedyPage(
  source: SourceKey,
  slug: string
): Promise<string | null> {
  const { author } = SOURCES[source];
  const cacheDir = path.join("data", "cache", source);
  const cacheFile = path.join(cacheDir, `${slug}.txt`);

  // Check cache first
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, "utf-8");
  }

  const url = `${BASE_URL}/${author}/${slug}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "HomeoClinicPro/1.0 (educational materia medica research)",
      },
    });
    if (!res.ok) {
      console.warn(`    ✗ ${slug}: HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();

    // Extract text content from HTML (simple approach)
    const text = htmlToText(html);

    // Cache it
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, text, "utf-8");

    return text;
  } catch (err) {
    console.warn(`    ✗ ${slug}: ${(err as Error).message}`);
    return null;
  }
}

// ===== HTML to Text =====

function htmlToText(html: string): string {
  // Remove scripts, styles, nav, footer
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // Try to extract main content area
  const mainMatch = text.match(
    /<main[\s\S]*?>([\s\S]*?)<\/main>/i
  ) ||
    text.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i) ||
    text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  if (mainMatch) {
    text = mainMatch[1];
  }

  // Convert headings to section markers
  text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n## $1\n");

  // Convert <p>, <br>, <li> to newlines
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "\n- ");
  text = text.replace(/<\/li>/gi, "");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");

  // Clean up whitespace
  text = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();

  return text;
}

// ===== Parse Sections =====

function parseSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = text.split("\n");
  let currentSection = "__header__";
  let buffer: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^##\s*(.+)$/);
    if (heading) {
      if (buffer.length > 0) {
        sections[currentSection] = buffer.join("\n").trim();
      }
      currentSection = heading[1].trim();
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) {
    sections[currentSection] = buffer.join("\n").trim();
  }

  return sections;
}

// ===== Slug to Remedy Code =====

function slugToRemedyCode(slug: string): string {
  // Convert slug to potential remedy codes
  // e.g., "bryonia-alba" -> "BRYO", "arsenicum-album" -> "ARS"
  return slug.toUpperCase().replace(/-/g, " ");
}

// ===== Load Remedies from DB for Matching =====

async function loadRemedyMap(): Promise<Map<string, string>> {
  const remedies = await prisma.remedy.findMany({
    select: { code: true, name: true, synonym: true },
  });

  // Build a map: various name forms -> code
  const map = new Map<string, string>();
  for (const r of remedies) {
    map.set(r.code.toUpperCase(), r.code);
    map.set(r.name.toUpperCase(), r.code);
    if (r.synonym) {
      for (const syn of r.synonym.split(",")) {
        map.set(syn.trim().toUpperCase(), r.code);
      }
    }
  }
  return map;
}

function matchRemedyCode(
  slug: string,
  remedyMap: Map<string, string>
): string | null {
  const name = slug.replace(/-/g, " ").toUpperCase();

  // Direct match by full name
  if (remedyMap.has(name)) return remedyMap.get(name)!;

  // Try first word
  const firstWord = name.split(" ")[0];
  if (remedyMap.has(firstWord)) return remedyMap.get(firstWord)!;

  // Try first 4 chars (common abbreviation)
  const abbrev = firstWord.slice(0, 4);
  if (remedyMap.has(abbrev)) return remedyMap.get(abbrev)!;

  // Try first 3 chars
  const abbrev3 = firstWord.slice(0, 3);
  if (remedyMap.has(abbrev3)) return remedyMap.get(abbrev3)!;

  // Fuzzy: check if any key starts with the first word
  for (const [key, code] of remedyMap) {
    if (key.startsWith(firstWord) || firstWord.startsWith(key)) {
      return code;
    }
  }

  return null;
}

// ===== Import to Database =====

async function importToDb(
  source: SourceKey,
  remedyMap: Map<string, string>
) {
  const { dbSource } = SOURCES[source];
  const cacheDir = path.join("data", "cache", source);

  if (!fs.existsSync(cacheDir)) {
    console.log(`  No cache directory for ${source}`);
    return;
  }

  const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith(".txt"));
  console.log(`  Found ${files.length} cached files for ${source}`);

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(".txt", "");
    const text = fs.readFileSync(path.join(cacheDir, file), "utf-8");

    if (!text || text.length < 50) {
      skipped++;
      continue;
    }

    const remedyCode = matchRemedyCode(slug, remedyMap);
    const remedyName = slug.replace(/-/g, " ");
    const sections = parseSections(text);

    try {
      await prisma.materiaMedica.upsert({
        where: {
          remedyCode_source: {
            remedyCode: remedyCode ?? slug.toUpperCase(),
            source: dbSource,
          },
        },
        create: {
          remedyCode: remedyCode ?? slug.toUpperCase(),
          remedyName,
          source: dbSource,
          content: text,
          sections: JSON.stringify(sections),
        },
        update: {
          content: text,
          sections: JSON.stringify(sections),
          remedyName,
        },
      });
      imported++;
    } catch (err) {
      console.warn(`    ✗ ${slug}: ${(err as Error).message}`);
      skipped++;
    }
  }

  console.log(
    `  ✓ ${source}: ${imported} imported, ${skipped} skipped`
  );
}

// ===== Extract Keynotes & Modalities for RemedyProfile =====

async function buildRemedyProfiles(remedyMap: Map<string, string>) {
  console.log("\n=== Building Remedy Profiles ===");

  // Get all materia medica entries
  const entries = await prisma.materiaMedica.findMany({
    where: {
      source: { in: ["BOERICKE", "ALLEN_KEYNOTES", "KENT"] },
    },
    select: { remedyCode: true, source: true, sections: true },
  });

  // Group by remedy code
  const grouped = new Map<
    string,
    { source: string; sections: Record<string, string> }[]
  >();
  for (const entry of entries) {
    if (!entry.sections) continue;
    const code = entry.remedyCode;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push({
      source: entry.source,
      sections: JSON.parse(entry.sections),
    });
  }

  let created = 0;
  for (const [remedyCode, sources] of grouped) {
    const keynotesPt: string[] = [];
    const keynotesEn: string[] = [];
    let modalitiesBetter: string[] = [];
    let modalitiesWorse: string[] = [];
    let constitution = "";

    for (const { source, sections } of sources) {
      // Extract keynotes from Allen
      if (source === "ALLEN_KEYNOTES") {
        const headerText = sections["__header__"] || "";
        const lines = headerText.split("\n").filter((l) => l.trim().length > 10);
        keynotesEn.push(...lines.slice(0, 10));
      }

      // Extract modalities from Boericke
      if (source === "BOERICKE") {
        for (const [key, val] of Object.entries(sections)) {
          const keyLower = key.toLowerCase();
          if (keyLower.includes("modalities") || keyLower.includes("worse") || keyLower.includes("better")) {
            const lines = val.split("\n");
            for (const line of lines) {
              const lower = line.toLowerCase();
              if (lower.includes("worse") || lower.includes("<")) {
                modalitiesWorse.push(line.trim());
              }
              if (lower.includes("better") || lower.includes(">")) {
                modalitiesBetter.push(line.trim());
              }
            }
          }
        }
      }
    }

    if (keynotesEn.length === 0 && modalitiesBetter.length === 0 && modalitiesWorse.length === 0) {
      continue;
    }

    try {
      await prisma.remedyProfile.upsert({
        where: { remedyCode },
        create: {
          remedyCode,
          keynotesEn: keynotesEn.length > 0 ? JSON.stringify(keynotesEn) : null,
          keynotesPt: null,
          modalitiesBetter: modalitiesBetter.length > 0 ? JSON.stringify(modalitiesBetter) : null,
          modalitiesWorse: modalitiesWorse.length > 0 ? JSON.stringify(modalitiesWorse) : null,
          constitution: constitution || null,
        },
        update: {
          keynotesEn: keynotesEn.length > 0 ? JSON.stringify(keynotesEn) : undefined,
          modalitiesBetter: modalitiesBetter.length > 0 ? JSON.stringify(modalitiesBetter) : undefined,
          modalitiesWorse: modalitiesWorse.length > 0 ? JSON.stringify(modalitiesWorse) : undefined,
        },
      });
      created++;
    } catch {
      // skip
    }
  }

  console.log(`  ✓ ${created} remedy profiles created/updated`);
}

// ===== Main =====

async function main() {
  const args = process.argv.slice(2);
  const sourceArg = args.find((a) => a.startsWith("--source="))?.split("=")[1] ?? "all";
  const importOnly = args.includes("--import-only");

  const sourcesToFetch: SourceKey[] =
    sourceArg === "all"
      ? ["boericke", "allen", "kent"]
      : [sourceArg as SourceKey];

  console.log("=== HomeoClinicPro Materia Medica Fetcher ===\n");

  // Load remedy map for matching
  console.log("Loading remedy codes from database...");
  const remedyMap = await loadRemedyMap();
  console.log(`  ${remedyMap.size} remedy name variants loaded\n`);

  if (!importOnly) {
    for (const source of sourcesToFetch) {
      const { label } = SOURCES[source];
      console.log(`\n--- Fetching ${label} ---`);

      // Fetch index
      const slugs = await fetchIndex(source);
      console.log(`  Found ${slugs.length} remedies in index`);

      // Fetch each remedy page
      let fetched = 0;
      for (const slug of slugs) {
        const cacheFile = path.join("data", "cache", source, `${slug}.txt`);
        if (fs.existsSync(cacheFile)) {
          fetched++;
          continue;
        }

        const text = await fetchRemedyPage(source, slug);
        if (text) {
          fetched++;
          process.stdout.write(
            `\r  Fetched: ${fetched}/${slugs.length} (${slug})          `
          );
        }

        await delay(DELAY_MS);
      }
      console.log(`\n  ✓ ${fetched}/${slugs.length} fetched and cached`);
    }
  }

  // Import to database
  console.log("\n=== Importing to Database ===");
  for (const source of sourcesToFetch) {
    console.log(`\n--- Importing ${SOURCES[source].label} ---`);
    await importToDb(source, remedyMap);
  }

  // Build remedy profiles
  await buildRemedyProfiles(remedyMap);

  await prisma.$disconnect();
  console.log("\n=== Done! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  prisma.$disconnect();
  process.exit(1);
});
