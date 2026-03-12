/**
 * Seed script: Correlatos (Remedy Correlates)
 * Imports correlate data from extracted JSON into the database.
 *
 * Usage: npx tsx prisma/seed-correlatos.mts
 */

import * as fs from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CORRELATOS_PATH =
  "C:/Users/Carlos Honorato/OneDrive/Área de trabalho/SIHOREMAX7/HomeoClinicPro-Projeto/data/extracted/correlatos.json";
const BATCH_SIZE = 1000;

interface CorrelatosEntry {
  x0: string;
  x1: string;
  x2: string;
  _active: boolean;
}

interface CorrelatosFile {
  fields: string[];
  count: number;
  data: CorrelatosEntry[];
}

function parseCorrelatos(data: CorrelatosFile): {
  term: string;
  relatedTerm: string;
  type: string;
}[] {
  const records: { term: string; relatedTerm: string; type: string }[] = [];

  for (const entry of data.data) {
    if (!entry._active) continue;
    if (!entry.x2 || entry.x2.trim().length === 0) continue;

    const term = entry.x0.trim();
    if (!term) continue;

    // x2 contains lines separated by \r\n
    // Each line format: RELATED_TERM;TYPE1;TYPE2
    const lines = entry.x2.split("\r\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(";");
      const relatedTerm = parts[0]?.trim();
      const type = parts[1]?.trim() || "";

      if (!relatedTerm) continue;

      records.push({ term, relatedTerm, type });
    }
  }

  return records;
}

async function main() {
  console.log("=== Seed Correlatos ===");
  console.log(`Reading from: ${CORRELATOS_PATH}`);

  // Read and parse JSON
  const raw = fs.readFileSync(CORRELATOS_PATH, "utf-8");
  const data: CorrelatosFile = JSON.parse(raw);

  console.log(`Source contains ${data.count} entries`);

  const records = parseCorrelatos(data);
  console.log(`Parsed ${records.length} correlate records`);

  // Clear existing correlates
  const deleted = await prisma.remedyCorrelate.deleteMany();
  console.log(`Cleared ${deleted.count} existing correlate records`);

  // Insert in batches
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const result = await prisma.remedyCorrelate.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;

    console.log(
      `  Progress: ${Math.min(i + BATCH_SIZE, records.length)}/${records.length} processed, ${inserted} inserted`,
    );
  }

  console.log(`\nDone! Inserted ${inserted} correlate records.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
