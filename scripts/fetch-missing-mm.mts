/**
 * Fetch materia medica from web for remedies that have NO data at all.
 * Uses multiple public domain sources:
 * - materiamedica.info (Boericke, Allen, Kent)
 * - homeoint.org (Clarke's Dictionary)
 *
 * Usage: npx tsx scripts/fetch-missing-mm.mts [--dry-run] [--limit N]
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = (() => {
  const idx = process.argv.indexOf("--limit");
  return idx >= 0 ? parseInt(process.argv[idx + 1]) : 0;
})();

const DELAY_MS = 1500;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CACHE_DIR = path.join("data", "cache", "clarke");
fs.mkdirSync(CACHE_DIR, { recursive: true });

// ===== HTML to text =====
function htmlToText(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  const mainMatch =
    text.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i) ||
    text.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i) ||
    text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (mainMatch) text = mainMatch[1];

  text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n## $1\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "\n- ");
  text = text.replace(/<\/li>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");
  text = text.split("\n").map((l) => l.trim())
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n").trim();
  return text;
}

// ===== Generate slug variants for remedy name =====
function nameToSlugs(name: string): string[] {
  const slugs: string[] = [];
  const base = name.toLowerCase()
    .replace(/[,()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  slugs.push(base);

  // First word only
  const parts = name.toLowerCase().split(/[\s,]+/);
  if (parts.length > 1) slugs.push(parts[0]);
  // First two words
  if (parts.length > 2) slugs.push(parts.slice(0, 2).join("-"));

  return [...new Set(slugs)];
}

// ===== Fetch from materiamedica.info =====
async function fetchMateriaMediaInfo(
  slug: string,
  author: string
): Promise<string | null> {
  const url = `https://www.materiamedica.info/en/materia-medica/${author}/${slug}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HomeoClinicPro/1.0 (educational research)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = htmlToText(html);
    return text.length > 200 ? text : null;
  } catch {
    return null;
  }
}

// ===== Fetch from homeoint.org (Clarke's Dictionary) =====
async function fetchClarke(remedyName: string): Promise<string | null> {
  const slug = remedyName.toLowerCase().split(/[\s,]+/)[0];
  const cacheFile = path.join(CACHE_DIR, `${slug}.txt`);

  if (fs.existsSync(cacheFile)) {
    const cached = fs.readFileSync(cacheFile, "utf-8");
    return cached.length > 100 ? cached : null;
  }

  // Clarke's dictionary on homeoint uses first-letter index
  const firstLetter = slug[0];
  const urls = [
    `https://www.homeoint.org/clarke/${slug}.htm`,
    `https://www.homeoint.org/clarke/${slug}a.htm`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "HomeoClinicPro/1.0 (educational research)" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const text = htmlToText(html);
      if (text.length > 200) {
        fs.writeFileSync(cacheFile, text, "utf-8");
        return text;
      }
    } catch {
      continue;
    }
  }

  // Cache miss
  fs.writeFileSync(cacheFile, "", "utf-8");
  return null;
}

// ===== Main =====
async function main() {
  console.log("=== Buscar Matéria Médica para Remédios Sem Dados ===\n");

  // Find remedies with no data at all
  const empty = await prisma.$queryRaw<{ code: string; name: string }[]>`
    SELECT r.code, r.name FROM "Remedy" r
    WHERE r.code NOT IN (SELECT "remedyCode" FROM "MateriaMedica")
      AND r.code NOT IN (SELECT term FROM "RemedyCorrelate")
      AND r.code NOT IN (SELECT "remedyCode" FROM "RemedyProfile")
      AND r.code NOT IN (SELECT "remedyCode" FROM "MiasmClassification")
    ORDER BY r.name
  `;

  const targets = LIMIT > 0 ? empty.slice(0, LIMIT) : empty;
  console.log(`${empty.length} remédios completamente vazios, processando ${targets.length}\n`);

  if (DRY_RUN) {
    console.log("DRY RUN - apenas listando remédios:");
    targets.forEach((r) => console.log(`  ${r.code}: ${r.name}`));
    await prisma.$disconnect();
    return;
  }

  let found = 0;
  let notFound = 0;
  const authors = ["william-boericke", "henry-c-allen", "james-tyler-kent"];
  const sourceMap: Record<string, string> = {
    "william-boericke": "BOERICKE",
    "henry-c-allen": "ALLEN_KEYNOTES",
    "james-tyler-kent": "KENT",
  };

  for (let i = 0; i < targets.length; i++) {
    const remedy = targets[i];
    const slugs = nameToSlugs(remedy.name);
    let gotData = false;

    // Try materiamedica.info for each author
    for (const author of authors) {
      if (gotData) break;
      for (const slug of slugs) {
        const text = await fetchMateriaMediaInfo(slug, author);
        if (text) {
          const dbSource = sourceMap[author];
          try {
            await prisma.materiaMedica.upsert({
              where: {
                remedyCode_source: { remedyCode: remedy.code, source: dbSource },
              },
              create: {
                remedyCode: remedy.code,
                remedyName: remedy.name,
                source: dbSource,
                content: text,
              },
              update: { content: text, remedyName: remedy.name },
            });
            console.log(`  ✓ ${remedy.code} (${remedy.name}) <- ${dbSource} via "${slug}"`);
            found++;
            gotData = true;
          } catch {
            // skip
          }
          break;
        }
        await delay(DELAY_MS);
      }
    }

    // Try Clarke's Dictionary
    if (!gotData) {
      const text = await fetchClarke(remedy.name);
      if (text) {
        try {
          await prisma.materiaMedica.upsert({
            where: {
              remedyCode_source: { remedyCode: remedy.code, source: "CLARKE" },
            },
            create: {
              remedyCode: remedy.code,
              remedyName: remedy.name,
              source: "CLARKE",
              content: text,
            },
            update: { content: text, remedyName: remedy.name },
          });
          console.log(`  ✓ ${remedy.code} (${remedy.name}) <- CLARKE`);
          found++;
          gotData = true;
        } catch {
          // skip
        }
      }
      await delay(DELAY_MS);
    }

    if (!gotData) {
      notFound++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`\n  Progresso: ${i + 1}/${targets.length} (${found} encontrados, ${notFound} sem dados)\n`);
    }
  }

  console.log(`\n✓ Concluído: ${found} remédios com dados encontrados, ${notFound} sem dados na web`);

  // Stats
  const totalMM = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT "remedyCode") as count FROM "MateriaMedica"
  `;
  const totalRemedies = await prisma.remedy.count();
  console.log(`Cobertura total: ${Number(totalMM[0].count)}/${totalRemedies} remédios com matéria médica`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
