/**
 * Import Hahnemann's Materia Medica Pura from extracted PDF text.
 * Source: "Matéria Médica Pura" by Samuel Hahnemann (Portuguese translation)
 *
 * Usage: npx tsx scripts/import-hahnemann-mm.mts
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Remedy heading line number -> remedy info
const REMEDY_HEADINGS: { line: number; heading: string; code: string }[] = [
  { line: 380, heading: "AMBRA GRISEA", code: "AMBR" },
  { line: 504, heading: "ANGUSTURA", code: "ANG" },
  { line: 656, heading: "ARGENTUM NITRICUM", code: "ARG-N" },
  { line: 688, heading: "ARGENTUM FOLIATUM", code: "ARG-MET" },
  { line: 799, heading: "ARNICA", code: "ARN" },
  { line: 988, heading: "ARSENICUM", code: "ARS" },
  { line: 1481, heading: "ASARUM", code: "ASAR" },
  { line: 1627, heading: "AURUM", code: "AUR" },
  { line: 1764, heading: "BELLADONNA", code: "BELL" },
  { line: 1971, heading: "BISMUTHUM", code: "BISM-SN" },
  { line: 2045, heading: "BRYONIA", code: "BRY" },
  { line: 2210, heading: "CALCAREA ACETICA", code: "CALC-ACT" },
  { line: 2336, heading: "CAMPHORA", code: "CAMPH" },
  { line: 2530, heading: "CANNABIS", code: "CANN-S" },
  { line: 2638, heading: "CAPSICUM", code: "CAPS" },
  { line: 2710, heading: "CARBO ANIMALIS", code: "CARB-AN" },
  { line: 2766, heading: "CARBO VEGETABILIS", code: "CARB-V" },
  { line: 2927, heading: "CHAMOMILLA", code: "CHAM" },
  { line: 3019, heading: "CHELIDONIUM", code: "CHEL" },
  { line: 3175, heading: "CHINA", code: "CHIN" },
  { line: 3484, heading: "CICUTA VIROSA", code: "CIC" },
  { line: 3576, heading: "CINA", code: "CINA" },
  { line: 3701, heading: "COCCULUS", code: "COCC" },
  { line: 3829, heading: "COLOCYNTHIS", code: "COLOC" },
  { line: 3906, heading: "CONIUM", code: "CON" },
  { line: 4235, heading: "CYCLAMEN", code: "CYCL" },
  { line: 4528, heading: "DROSERA", code: "DROS" },
  { line: 4632, heading: "DULCAMARA", code: "DULC" },
  { line: 4791, heading: "EUPHRASIA", code: "EUPHR" },
  { line: 4842, heading: "FERRUM", code: "FERR" },
  { line: 4914, heading: "GUAIACUM", code: "GUAJ" },
  { line: 4974, heading: "HELLEBORUS NIGER", code: "HELL" },
  { line: 5074, heading: "HEPAR SULPHURIS CALCAREUM", code: "HEP" },
  { line: 5178, heading: "HYOSCYAMUS", code: "HYOS" },
  { line: 5497, heading: "IGNATIA", code: "IGN" },
  { line: 5693, heading: "IPECACUANHA", code: "IP" },
  { line: 6203, heading: "LEDUM", code: "LED" },
  { line: 6912, heading: "MANGANUM ACETICUM", code: "MANG-ACT" },
  { line: 7209, heading: "MERCURIUS", code: "MERC" },
  { line: 8258, heading: "MURIATICUM ACIDUM", code: "MUR-AC" },
  { line: 8400, heading: "NUX VOMICA", code: "NUX-V" },
  { line: 9206, heading: "PHOSPHORICUM ACIDUM", code: "PH-AC" },
];

// End markers for sections (next remedy or known section breaks)
const END_MARKERS = REMEDY_HEADINGS.map((h) => h.line).sort((a, b) => a - b);
END_MARKERS.push(12661); // EOF

async function main() {
  console.log("=== Import Hahnemann Materia Medica Pura ===\n");

  const filePath = path.join("data", "hahnemann-mm-pura.txt");
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    console.log("Run: pdftotext 'path/to/Matéria médica pura.pdf' data/hahnemann-mm-pura.txt");
    process.exit(1);
  }

  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  console.log(`Loaded ${lines.length} lines from PDF text\n`);

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < REMEDY_HEADINGS.length; i++) {
    const remedy = REMEDY_HEADINGS[i];
    const startLine = remedy.line; // 1-indexed
    // Find end: next remedy heading or EOF
    const nextStart = END_MARKERS.find((l) => l > startLine) ?? lines.length;

    // Extract content between heading and next section
    const content = lines
      .slice(startLine, nextStart - 1) // -1 because heading is on startLine (0-indexed = startLine-1)
      .join("\n")
      .trim();

    if (content.length < 100) {
      console.log(`  Skip ${remedy.code} (${remedy.heading}): too short (${content.length} chars)`);
      skipped++;
      continue;
    }

    const remedyName = remedy.heading.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    try {
      await prisma.materiaMedica.upsert({
        where: {
          remedyCode_source: {
            remedyCode: remedy.code,
            source: "HAHNEMANN",
          },
        },
        create: {
          remedyCode: remedy.code,
          remedyName,
          source: "HAHNEMANN",
          content: `${remedy.heading} (Matéria Médica Pura - Hahnemann)\n\n${content}`,
          sections: null,
        },
        update: {
          content: `${remedy.heading} (Matéria Médica Pura - Hahnemann)\n\n${content}`,
          remedyName,
        },
      });
      console.log(`  ✓ ${remedy.code} (${remedy.heading}): ${content.length} chars`);
      imported++;
    } catch (err) {
      console.warn(`  ✗ ${remedy.code}: ${(err as Error).message}`);
      skipped++;
    }
  }

  console.log(`\n✓ ${imported} remedies imported from Hahnemann, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
