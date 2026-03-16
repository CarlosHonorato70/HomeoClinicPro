/**
 * Build RemedyProfile entries from all MateriaMedica data.
 * Extracts keynotes and modalities from Boericke and Allen entries.
 *
 * Usage: npx tsx scripts/build-remedy-profiles.mts
 */

import { PrismaPg } from "@prisma/adapter-pg";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Build Remedy Profiles ===\n");

  // Get all materia medica entries from structured sources
  const entries = await prisma.materiaMedica.findMany({
    where: {
      source: { in: ["BOERICKE", "ALLEN_KEYNOTES", "KENT"] },
    },
    select: { remedyCode: true, source: true, content: true },
  });

  console.log(`Processing ${entries.length} materia medica entries\n`);

  // Group by remedy code
  const grouped = new Map<string, { source: string; content: string }[]>();
  for (const entry of entries) {
    if (!entry.content) continue;
    const code = entry.remedyCode;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push({ source: entry.source, content: entry.content });
  }

  let created = 0;

  for (const [remedyCode, sources] of grouped) {
    const keynotesEn: string[] = [];
    let modalitiesBetter: string[] = [];
    let modalitiesWorse: string[] = [];

    for (const { source, content: rawContent } of sources) {
      const content = rawContent.replace(/\r\n?/g, "\n");

      // Extract keynotes from Allen
      if (source === "ALLEN_KEYNOTES") {
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (
            trimmed.startsWith("##") || trimmed.startsWith("Index ") ||
            trimmed.startsWith("Materia Medica") || trimmed.length < 20 ||
            trimmed.includes("Remedia Homeopathy") || trimmed.includes("customers from") ||
            trimmed.includes("Keynotes  by") || trimmed.includes("You can read the full book") ||
            trimmed.includes("is available at")
          ) continue;
          const sentences = trimmed.split(/(?<=[.;])\s+/).filter((s) => s.length > 15);
          keynotesEn.push(...sentences.slice(0, 15));
          break;
        }
      }

      // Extract modalities from Boericke — inline pattern
      if (source === "BOERICKE") {
        // Pattern: "Modalities.--Worse, X, Y. Better, Z."
        const modalMatch = content.match(
          /Modalities\.?\s*[-—]+\s*([\s\S]*?)(?=\s*Relationship|$)/im
        );
        if (modalMatch) {
          const modalText = modalMatch[1];
          const betterSplit = modalText.split(/Better[,.\s]/i);
          if (betterSplit.length >= 2) {
            const worseText = betterSplit[0].replace(/^\s*Worse[,.\s]*/i, "").trim();
            const betterText = betterSplit.slice(1).join(" ").trim().replace(/\.\s*$/, "");
            if (worseText) {
              modalitiesWorse = worseText.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 80);
            }
            if (betterText) {
              modalitiesBetter = betterText.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 80);
            }
          } else {
            const worseText = modalText.replace(/^\s*Worse[,.\s]*/i, "").trim();
            if (worseText) {
              modalitiesWorse = worseText.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 80);
            }
          }
        }

        // Also try to extract keynotes from the first paragraph of Boericke
        if (keynotesEn.length === 0) {
          // Get the first substantial paragraph after the remedy name heading
          const lines = content.split("\n");
          let foundHeading = false;
          for (const line of lines) {
            if (line.startsWith("##") && !line.includes("Materia Medica")) {
              foundHeading = true;
              continue;
            }
            if (foundHeading) {
              const trimmed = line.trim();
              if (
                trimmed.length < 30 || trimmed.startsWith("Index ") ||
                trimmed.includes("Remedia Homeopathy") || trimmed.includes("is available at") ||
                trimmed.includes("You can read the full book")
              ) continue;
              // Get first 2-3 sentences as keynotes
              const sentences = trimmed.split(/(?<=[.])\s+/).filter((s) => s.length > 15);
              keynotesEn.push(...sentences.slice(0, 5));
              break;
            }
          }
        }
      }

      // Allen uses < for worse and > for better
      if (source === "ALLEN_KEYNOTES" && modalitiesWorse.length === 0) {
        const worseMatch = content.match(/<\s+([^>]+?)(?:\.\s*>|$)/);
        const betterMatch = content.match(/>\s+([^<]+?)(?:\.\s*$|\n)/);
        if (worseMatch) {
          modalitiesWorse = worseMatch[1].split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 80);
        }
        if (betterMatch) {
          modalitiesBetter = betterMatch[1].split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 80);
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
          constitution: null,
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

  console.log(`✓ ${created} remedy profiles created/updated\n`);

  // Stats
  const totalProfiles = await prisma.remedyProfile.count();
  const totalRemedies = await prisma.remedy.count();
  console.log(`Total profiles: ${totalProfiles}/${totalRemedies}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
