import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const classifications = await prisma.miasmClassification.groupBy({
      by: ["miasm", "authority"],
      _count: { id: true },
      orderBy: { miasm: "asc" },
    });

    // Group by miasm
    const miasms: Record<
      string,
      { total: number; byAuthority: Record<string, number> }
    > = {};

    for (const row of classifications) {
      if (!miasms[row.miasm]) {
        miasms[row.miasm] = { total: 0, byAuthority: {} };
      }
      miasms[row.miasm].total += row._count.id;
      miasms[row.miasm].byAuthority[row.authority] = row._count.id;
    }

    return NextResponse.json({ miasms });
  } catch (error) {
    console.error("Error fetching miasms:", error);
    return NextResponse.json(
      { error: "Failed to fetch miasm data" },
      { status: 500 }
    );
  }
}
