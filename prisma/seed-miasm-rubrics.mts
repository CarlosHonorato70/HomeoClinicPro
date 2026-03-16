/**
 * Aggregate miasm data from existing Rubric table.
 * For each remedy, counts how many rubrics of each miasm it appears in.
 * Inserts results into MiasmClassification with authority "SIHORE_REPERTORY".
 *
 * Usage: npx tsx prisma/seed-miasm-rubrics.mts
 */

import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Seed Miasm Classifications from Rubric Data ===\n");

  // Get all rubrics that have miasm data
  const rubrics = await prisma.rubric.findMany({
    where: { miasm: { not: null } },
    select: { remedies: true, miasm: true },
  });

  console.log(`Found ${rubrics.length} rubrics with miasm data`);

  if (rubrics.length === 0) {
    console.log("No miasm data in rubrics. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // Aggregate: remedy -> miasm -> count
  const remedyMiasms = new Map<string, Map<string, number>>();

  for (const rubric of rubrics) {
    const miasm = rubric.miasm!.trim().toUpperCase();
    if (!miasm || miasm === "" || miasm === "0") continue;

    // Normalize miasm names
    let normalizedMiasm = miasm;
    if (miasm.includes("PSOR")) normalizedMiasm = "PSORA";
    else if (miasm.includes("SYC") || miasm.includes("SICO")) normalizedMiasm = "SYCOSIS";
    else if (miasm.includes("SYPH") || miasm.includes("SIFIL")) normalizedMiasm = "SYPHILIS";
    else if (miasm.includes("TUBER")) normalizedMiasm = "TUBERCULINISM";
    else if (miasm.includes("CANC")) normalizedMiasm = "CANCERINISM";
    else continue; // Unknown miasm

    const remedyCodes = rubric.remedies.trim().split(/\s+/);
    for (const code of remedyCodes) {
      const key = code.toUpperCase();
      if (!remedyMiasms.has(key)) remedyMiasms.set(key, new Map());
      const counts = remedyMiasms.get(key)!;
      counts.set(normalizedMiasm, (counts.get(normalizedMiasm) ?? 0) + 1);
    }
  }

  console.log(`${remedyMiasms.size} remedies with miasm associations`);

  // Insert into MiasmClassification
  let inserted = 0;
  let skipped = 0;

  for (const [remedyCode, miasms] of remedyMiasms) {
    // Only keep miasms with significant presence (>= 3 rubrics)
    for (const [miasm, count] of miasms) {
      if (count < 3) continue;

      try {
        await prisma.miasmClassification.upsert({
          where: {
            remedyCode_miasm_authority: {
              remedyCode,
              miasm,
              authority: "SIHORE_REPERTORY",
            },
          },
          create: {
            remedyCode,
            miasm,
            authority: "SIHORE_REPERTORY",
            notes: `Presente em ${count} rubricas com miasma ${miasm}`,
          },
          update: {
            notes: `Presente em ${count} rubricas com miasma ${miasm}`,
          },
        });
        inserted++;
      } catch {
        skipped++;
      }
    }
  }

  console.log(`✓ ${inserted} miasm classifications created, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
