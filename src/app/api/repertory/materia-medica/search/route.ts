import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const source = searchParams.get("source");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    OR: [
      { remedyName: { contains: query, mode: "insensitive" } },
      { remedyCode: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };

  if (source) {
    where.source = { equals: source, mode: "insensitive" };
  }

  const [results, total, sources] = await Promise.all([
    prisma.materiaMedica.findMany({
      where,
      select: {
        id: true,
        remedyCode: true,
        remedyName: true,
        source: true,
        content: true,
      },
      orderBy: { remedyName: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.materiaMedica.count({ where }),
    prisma.materiaMedica.findMany({
      select: { source: true },
      distinct: ["source"],
      orderBy: { source: "asc" },
    }),
  ]);

  // Truncate content for preview (first 300 chars)
  const previews = results.map((r) => ({
    id: r.id,
    remedyCode: r.remedyCode,
    remedyName: r.remedyName,
    source: r.source,
    preview: r.content ? r.content.substring(0, 300) + (r.content.length > 300 ? "..." : "") : "",
  }));

  return NextResponse.json({
    results: previews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    sources: sources.map((s) => s.source).filter(Boolean),
  });
}
