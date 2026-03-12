import fs from "fs";
import path from "path";

const dataPath = path.resolve(process.cwd(), "data/extracted/repertory.json");

console.log("Loading repertory.json...");
const raw = fs.readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);

const chapterMap: Record<string, string> = data._chapter_map;
const remediosData: { codigo: string; nomeremedio: string; sinonimia: string }[] =
  data._remedios.data;

const chapterKeys = Object.keys(data).filter((k) => !k.startsWith("_"));

console.log(`Found ${chapterKeys.length} chapters, ${remediosData.length} remedies`);

import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Enable pg_trgm extension
  console.log("Enabling pg_trgm extension...");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS pg_trgm");

  // Clean existing repertory data
  console.log("Cleaning existing data...");
  await prisma.$executeRawUnsafe('DELETE FROM "Rubric"');
  await prisma.$executeRawUnsafe('DELETE FROM "Chapter"');
  await prisma.$executeRawUnsafe('DELETE FROM "Remedy"');

  // Reset autoincrement sequences
  await prisma.$executeRawUnsafe('ALTER SEQUENCE "Rubric_id_seq" RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE "Remedy_id_seq" RESTART WITH 1');

  // Insert remedies in batch
  console.log("Inserting remedies...");
  const REMEDY_BATCH_SIZE = 1000;
  for (let i = 0; i < remediosData.length; i += REMEDY_BATCH_SIZE) {
    const batch = remediosData.slice(i, i + REMEDY_BATCH_SIZE).map((item) => ({
      code: item.codigo,
      name: item.nomeremedio,
      synonym: item.sinonimia || null,
    }));
    await prisma.remedy.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
  console.log(`  Inserted ${remediosData.length} remedies`);

  // Insert chapters and rubrics
  console.log("Inserting chapters and rubrics...");
  let totalRubrics = 0;

  for (const key of chapterKeys) {
    const chapter = data[key];
    const chapterName = chapterMap[key] || key;
    const rubrics = chapter.data || [];

    if (rubrics.length === 0) continue;

    // Insert chapter
    await prisma.chapter.create({
      data: {
        id: key,
        name: chapterName,
        rubricCount: rubrics.length,
      },
    });

    // Insert rubrics in batches
    const RUBRIC_BATCH_SIZE = 5000;
    for (let i = 0; i < rubrics.length; i += RUBRIC_BATCH_SIZE) {
      const batch = rubrics
        .slice(i, i + RUBRIC_BATCH_SIZE)
        .map(
          (r: {
            sintoporx: string;
            sintoing: string;
            remedi: string;
            numrem: string;
            psora: string;
            syphi: string;
            sicos: string;
          }) => {
            const remedyCount = parseInt(r.numrem?.replace("r", "") || "0", 10);
            const remedies = (r.remedi || "").trim();

            const miasmParts: string[] = [];
            if (r.psora) miasmParts.push(`psora:${r.psora}`);
            if (r.syphi) miasmParts.push(`syphi:${r.syphi}`);
            if (r.sicos) miasmParts.push(`sicos:${r.sicos}`);
            const miasm = miasmParts.length > 0 ? miasmParts.join(",") : null;

            return {
              chapterId: key,
              symptomPt: r.sintoporx || "",
              symptomEn: r.sintoing || null,
              remedies,
              remedyCount,
              miasm,
            };
          }
        );

      await prisma.rubric.createMany({ data: batch });
    }

    totalRubrics += rubrics.length;
    console.log(`  ${key}: ${chapterName} — ${rubrics.length} rubrics`);
  }

  console.log(`\nTotal: ${totalRubrics} rubrics inserted`);

  // Create trigram indexes for search
  console.log("Creating trigram search indexes...");
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS rubric_symptompt_trgm ON "Rubric" USING GIN ("symptomPt" gin_trgm_ops)'
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS rubric_symptomen_trgm ON "Rubric" USING GIN ("symptomEn" gin_trgm_ops)'
  );

  console.log("Trigram indexes created successfully!");
  console.log("\nRepertory seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
