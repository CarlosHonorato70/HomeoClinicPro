/**
 * Seed script: Materia Medica
 * Imports materia medica text files from SIHORE TEXTOS directory into the database.
 *
 * Usage: npx tsx prisma/seed-materia-medica.mts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const TEXTOS_DIR =
  process.env.TEXTOS_DIR ||
  path.resolve(process.cwd(), "data/textos");
const BATCH_SIZE = 100;

interface ParsedMateriaMedica {
  remedyCode: string;
  remedyName: string;
  content: string;
  sections: Record<string, string>;
}

function readLatin1File(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  // Decode latin-1 buffer to utf-8 string
  const decoder = new TextDecoder("latin1");
  // Remove null bytes (0x00) that PostgreSQL rejects
  return decoder.decode(buf).replace(/\0/g, "");
}

function parseMateriaMedicaFile(
  filePath: string,
  fileName: string,
): ParsedMateriaMedica {
  const text = readLatin1File(filePath);
  const lines = text.split(/\r?\n/);

  // Extract remedy code from filename: _ABEL.TXT -> ABEL
  const remedyCode = fileName.replace(/^_/, "").replace(/\.TXT$/i, "").toUpperCase();

  // Extract remedy name from first line
  const remedyName = lines[0]?.trim() || remedyCode;

  // Parse sections: lines starting with # are section headers
  const sections: Record<string, string> = {};
  let currentSection = "__header__";
  const sectionLines: Record<string, string[]> = { [currentSection]: [] };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("#")) {
      // Section header: #Mente -> "Mente"
      currentSection = line.slice(1).trim();
      if (!sectionLines[currentSection]) {
        sectionLines[currentSection] = [];
      }
    } else if (line.startsWith("@")) {
      // Source header: treat as a subsection marker within current flow
      // We include it in the current section content
      if (!sectionLines[currentSection]) {
        sectionLines[currentSection] = [];
      }
      sectionLines[currentSection].push(line);
    } else {
      if (!sectionLines[currentSection]) {
        sectionLines[currentSection] = [];
      }
      sectionLines[currentSection].push(line);
    }
  }

  // Build sections object, trimming empty lines at start/end of each section
  for (const [key, sLines] of Object.entries(sectionLines)) {
    const trimmed = sLines.join("\n").trim();
    if (trimmed.length > 0) {
      sections[key] = trimmed;
    }
  }

  // Full content is the entire file text (already utf-8)
  const content = text;

  return { remedyCode, remedyName, content, sections };
}

async function main() {
  console.log("=== Seed Materia Medica ===");
  console.log(`Reading files from: ${TEXTOS_DIR}`);

  // List all _*.TXT files
  const allFiles = fs.readdirSync(TEXTOS_DIR);
  const txtFiles = allFiles.filter(
    (f) => f.startsWith("_") && f.toUpperCase().endsWith(".TXT"),
  );

  console.log(`Found ${txtFiles.length} materia medica TXT files`);

  const records: {
    remedyCode: string;
    remedyName: string;
    source: string;
    content: string;
    sections: string;
  }[] = [];

  let skipped = 0;

  for (const fileName of txtFiles) {
    const filePath = path.join(TEXTOS_DIR, fileName);
    try {
      const parsed = parseMateriaMedicaFile(filePath, fileName);
      records.push({
        remedyCode: parsed.remedyCode,
        remedyName: parsed.remedyName,
        source: "SIHORE",
        content: parsed.content,
        sections: JSON.stringify(parsed.sections),
      });
    } catch (err) {
      console.warn(`  WARNING: Failed to parse ${fileName}: ${err}`);
      skipped++;
    }
  }

  console.log(
    `Parsed ${records.length} files successfully, ${skipped} skipped`,
  );

  // Insert in batches
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const result = await prisma.materiaMedica.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;

    if ((i + BATCH_SIZE) % BATCH_SIZE === 0 || i + BATCH_SIZE >= records.length) {
      console.log(
        `  Progress: ${Math.min(i + BATCH_SIZE, records.length)}/${records.length} processed, ${inserted} inserted`,
      );
    }
  }

  console.log(`\nDone! Inserted ${inserted} materia medica records.`);
  if (skipped > 0) {
    console.log(`Skipped ${skipped} files due to parse errors.`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
