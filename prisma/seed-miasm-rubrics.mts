/**
 * Aggregate miasm data from existing Rubric table.
 * Rubric miasm format: "psora:100,syphi:,sicos:" or "psora:100,syphi:50,sicos:50"
 * For each remedy, counts how many rubrics with strong miasm presence (>=50) it appears in.
 * Inserts results into MiasmClassification with authority "REPERTORIO".
 *
 * Usage: npx tsx prisma/seed-miasm-rubrics.mts
 */

import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Parse miasm string like "psora:100,syphi:,sicos:" into active miasms
function parseMiasmString(miasm: string): string[] {
  const active: string[] = [];
  const parts = miasm.toLowerCase().split(",");

  for (const part of parts) {
    const [name, valueStr] = part.split(":");
    if (!name) continue;

    const value = parseInt(valueStr || "0", 10);
    if (isNaN(value) || value < 50) continue; // Only strong associations

    // Normalize miasm name
    const trimmed = name.trim();
    if (trimmed.startsWith("psor")) active.push("PSORA");
    else if (trimmed.startsWith("syph") || trimmed.startsWith("sifil")) active.push("SYPHILIS");
    else if (trimmed.startsWith("sico") || trimmed.startsWith("syco")) active.push("SYCOSIS");
    else if (trimmed.startsWith("tuber")) active.push("TUBERCULINISM");
    else if (trimmed.startsWith("canc")) active.push("CANCERINISM");
  }

  return active;
}

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
    const activeMiasms = parseMiasmString(rubric.miasm!);
    if (activeMiasms.length === 0) continue;

    const remedyCodes = rubric.remedies.trim().split(/\s+/);
    for (const code of remedyCodes) {
      if (!code) continue;
      const key = code.toUpperCase();
      if (!remedyMiasms.has(key)) remedyMiasms.set(key, new Map());
      const counts = remedyMiasms.get(key)!;
      for (const miasm of activeMiasms) {
        counts.set(miasm, (counts.get(miasm) ?? 0) + 1);
      }
    }
  }

  console.log(`${remedyMiasms.size} remedies with miasm associations`);

  // Insert into MiasmClassification in batches
  let inserted = 0;
  let skipped = 0;
  const batch: { remedyCode: string; miasm: string; authority: string; notes: string }[] = [];

  for (const [remedyCode, miasms] of remedyMiasms) {
    for (const [miasm, count] of miasms) {
      if (count < 5) continue; // Only significant associations

      batch.push({
        remedyCode,
        miasm,
        authority: "REPERTORIO",
        notes: `Presente em ${count} rubricas com miasma ${miasm}`,
      });
    }
  }

  console.log(`Inserting ${batch.length} classifications...`);

  // Insert in chunks of 100
  for (let i = 0; i < batch.length; i += 100) {
    const chunk = batch.slice(i, i + 100);
    for (const item of chunk) {
      try {
        await prisma.miasmClassification.upsert({
          where: {
            remedyCode_miasm_authority: {
              remedyCode: item.remedyCode,
              miasm: item.miasm,
              authority: item.authority,
            },
          },
          create: item,
          update: { notes: item.notes },
        });
        inserted++;
      } catch {
        skipped++;
      }
    }
    process.stdout.write(`\r  Progress: ${Math.min(i + 100, batch.length)}/${batch.length}`);
  }

  console.log(`\n✓ ${inserted} miasm classifications created, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
