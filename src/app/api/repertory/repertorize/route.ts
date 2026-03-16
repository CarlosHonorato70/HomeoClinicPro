import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  repertorize,
  type RepertorizationMethod,
  type WeightedRubric,
  type RubricWeight,
  type RubricCategory,
} from "@/lib/repertory";

export const dynamic = "force-dynamic";

interface RubricConfig {
  id: number;
  weight?: RubricWeight;
  category?: RubricCategory;
  intensity?: 1 | 2 | 3;
  eliminated?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      rubricIds,
      method = "sum",
      rubricConfigs,
    } = body as {
      rubricIds?: number[];
      method?: RepertorizationMethod;
      rubricConfigs?: RubricConfig[];
    };

    // Support both legacy (rubricIds only) and new format (rubricConfigs)
    const configs: RubricConfig[] =
      rubricConfigs ??
      (rubricIds ?? []).map((id: number) => ({ id: Number(id) }));

    if (configs.length === 0) {
      return NextResponse.json(
        { error: "No rubrics provided" },
        { status: 400 }
      );
    }

    const ids = configs.map((c) => Number(c.id)).filter((n) => !isNaN(n));

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No valid rubric IDs provided" },
        { status: 400 }
      );
    }

    const rubrics = await prisma.rubric.findMany({
      where: { id: { in: ids } },
    });

    // Map DB rubrics to WeightedRubric with user configurations
    const configMap = new Map(configs.map((c) => [Number(c.id), c]));

    const weightedRubrics: WeightedRubric[] = rubrics.map((r) => {
      const cfg = configMap.get(r.id);
      return {
        id: r.id,
        remedies: r.remedies,
        remedyCount: r.remedyCount,
        weight: cfg?.weight,
        category: cfg?.category,
        intensity: cfg?.intensity,
        eliminated: cfg?.eliminated,
      };
    });

    const results = repertorize(
      weightedRubrics,
      method as RepertorizationMethod,
      50
    );

    return NextResponse.json({
      results,
      rubricCount: rubrics.length,
      method,
    });
  } catch (error) {
    console.error("Error performing repertorization:", error);
    return NextResponse.json(
      { error: "Failed to perform repertorization" },
      { status: 500 }
    );
  }
}
