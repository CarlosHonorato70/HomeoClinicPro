/**
 * Mark remedies as visible/hidden based on data availability.
 * A remedy is visible if it has at least ONE of:
 * - Materia medica entry
 * - Appears in rubrics (via MateriaMedica AUTO_SUMMARY = proxy)
 * - Has miasm classification
 * - Has a profile
 * - Has correlates
 *
 * Remedies with no data at all are marked visible = false.
 *
 * Usage: npx tsx scripts/update-remedy-visibility.mts [--dry-run]
 */

import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  console.log("=== Atualizar Visibilidade dos Remédios ===\n");

  // Find remedies with no data at all
  const empty = await prisma.$queryRaw<{ code: string; name: string }[]>`
    SELECT r.code, r.name FROM "Remedy" r
    WHERE r.code NOT IN (SELECT "remedyCode" FROM "MateriaMedica")
      AND r.code NOT IN (SELECT term FROM "RemedyCorrelate")
      AND r.code NOT IN (SELECT "remedyCode" FROM "RemedyProfile")
      AND r.code NOT IN (SELECT "remedyCode" FROM "MiasmClassification")
    ORDER BY r.code
  `;

  const total = await prisma.remedy.count();
  const visible = total - empty.length;

  console.log(`Total de remédios: ${total}`);
  console.log(`Com dados (visíveis): ${visible}`);
  console.log(`Sem dados (ocultar): ${empty.length}\n`);

  if (DRY_RUN) {
    console.log("DRY RUN — nenhuma alteração feita.");
    console.log("\nExemplos de remédios que seriam ocultados:");
    empty.slice(0, 20).forEach((r) => console.log(`  ${r.code}: ${r.name}`));
    await prisma.$disconnect();
    return;
  }

  // First: reset all to visible
  await prisma.remedy.updateMany({
    data: { visible: true },
  });

  // Then: hide empty remedies
  if (empty.length > 0) {
    const codes = empty.map((r) => r.code);
    await prisma.remedy.updateMany({
      where: { code: { in: codes } },
      data: { visible: false },
    });
  }

  console.log(`✓ ${visible} remédios marcados como visíveis`);
  console.log(`✓ ${empty.length} remédios marcados como ocultos`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
