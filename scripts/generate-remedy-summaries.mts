/**
 * Generate materia medica summaries for remedies that don't have any.
 * Uses existing rubric data to create a basic profile:
 * - Top chapters where the remedy appears
 * - Top rubrics (most specific, with fewest remedies)
 * - Miasm classification if available
 *
 * Usage: npx tsx scripts/generate-remedy-summaries.mts
 */

import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Generate Materia Medica Summaries ===\n");

  // Find remedies without any materia medica
  const remediesWithoutMM = await prisma.$queryRaw<
    { code: string; name: string }[]
  >`
    SELECT r.code, r.name FROM "Remedy" r
    WHERE NOT EXISTS (
      SELECT 1 FROM "MateriaMedica" mm WHERE mm."remedyCode" = r.code
    )
    ORDER BY r.code
  `;

  console.log(`Found ${remediesWithoutMM.length} remedies without materia medica\n`);

  // Get chapters for reference
  const chapters = await prisma.chapter.findMany({
    select: { id: true, name: true },
  });
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  let created = 0;
  let skipped = 0;

  for (const remedy of remediesWithoutMM) {
    // Find rubrics where this remedy appears (most specific first)
    const rubrics = await prisma.$queryRaw<
      {
        id: number;
        symptomPt: string;
        symptomEn: string | null;
        remedyCount: number;
        chapterId: string;
      }[]
    >`
      SELECT id, "symptomPt", "symptomEn", "remedyCount", "chapterId"
      FROM "Rubric"
      WHERE "remedies" ILIKE ${"%" + remedy.code + "%"}
      ORDER BY "remedyCount" ASC
      LIMIT 50
    `;

    if (rubrics.length === 0) {
      skipped++;
      continue;
    }

    // Count by chapter
    const chapterCounts = new Map<string, number>();
    for (const r of rubrics) {
      chapterCounts.set(r.chapterId, (chapterCounts.get(r.chapterId) || 0) + 1);
    }
    const topChapters = [...chapterCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([chId, count]) => {
        const ch = chapterMap.get(chId);
        return ch ? `${ch.name} (${count} rubricas)` : `Cap. ${chId} (${count})`;
      });

    // Get most specific rubrics (fewest remedies = most characteristic)
    const specificRubrics = rubrics
      .filter((r) => r.remedyCount <= 20)
      .slice(0, 10)
      .map((r) => `- ${r.symptomPt}${r.symptomEn ? ` (${r.symptomEn})` : ""}`);

    // Get miasm data
    const miasms = await prisma.miasmClassification.findMany({
      where: { remedyCode: remedy.code },
      select: { miasm: true, authority: true },
    });

    // Build summary text
    const parts: string[] = [];
    parts.push(`${remedy.name} (${remedy.code})`);
    parts.push(`\nResumo gerado automaticamente a partir dos dados do repertorio.\n`);

    if (topChapters.length > 0) {
      parts.push(`\n## Principais areas de atuacao`);
      parts.push(topChapters.join("\n"));
    }

    if (miasms.length > 0) {
      parts.push(`\n## Classificacao miasmatica`);
      parts.push(miasms.map((m) => `- ${m.miasm} (${m.authority})`).join("\n"));
    }

    if (specificRubrics.length > 0) {
      parts.push(`\n## Sintomas caracteristicos (rubricas mais especificas)`);
      parts.push(specificRubrics.join("\n"));
    }

    parts.push(`\n\nTotal de rubricas: ${rubrics.length}+ onde este remedio aparece.`);

    const content = parts.join("\n");

    try {
      await prisma.materiaMedica.upsert({
        where: {
          remedyCode_source: {
            remedyCode: remedy.code,
            source: "AUTO_SUMMARY",
          },
        },
        create: {
          remedyCode: remedy.code,
          remedyName: remedy.name,
          source: "AUTO_SUMMARY",
          content,
          sections: null,
        },
        update: {
          content,
          remedyName: remedy.name,
        },
      });
      created++;
    } catch {
      skipped++;
    }

    if (created % 100 === 0 && created > 0) {
      process.stdout.write(`\r  Progress: ${created} created, ${skipped} skipped`);
    }
  }

  console.log(`\n✓ ${created} summaries created, ${skipped} skipped`);

  // Final stats
  const totalWithMM = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT "remedyCode") as count FROM "MateriaMedica"
  `;
  const totalRemedies = await prisma.remedy.count();
  console.log(
    `\nCobertura: ${Number(totalWithMM[0].count)}/${totalRemedies} remedios com materia medica`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
