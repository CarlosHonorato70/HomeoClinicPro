import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";
import { z } from "zod";

const clinicalCaseSchema = z.object({
  title: z.string().min(1, "Titulo obrigatorio").max(300),
  summary: z.string().min(1, "Resumo obrigatorio"),
  symptoms: z.string().min(1, "Sintomas obrigatorios"),
  rubrics: z.string().optional(),
  repertorization: z.string().optional(),
  prescribedRemedy: z.string().max(200).optional(),
  potency: z.string().max(50).optional(),
  outcome: z.string().optional(),
  outcomeRating: z.number().int().min(1).max(5).optional(),
  tags: z.string().max(500).optional(),
  patientAge: z.number().int().min(0).max(150).optional(),
  patientSex: z.enum(["M", "F"]).optional(),
});

function decryptCase(c: any) {
  return {
    ...c,
    summary: tryDecrypt(c.summary),
    symptoms: tryDecrypt(c.symptoms),
    outcome: c.outcome ? tryDecrypt(c.outcome) : null,
  };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const remedy = searchParams.get("remedy") || "";
  const rating = searchParams.get("rating");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = 20;

  const where: any = { clinicId: session.user.clinicId };

  if (remedy) {
    where.prescribedRemedy = { contains: remedy, mode: "insensitive" };
  }
  if (rating) {
    where.outcomeRating = Number(rating);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
      { prescribedRemedy: { contains: search, mode: "insensitive" } },
    ];
  }

  const [cases, total] = await Promise.all([
    prisma.clinicalCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        createdBy: { select: { name: true } },
      },
    }),
    prisma.clinicalCase.count({ where }),
  ]);

  return NextResponse.json({
    cases: cases.map(decryptCase),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = clinicalCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const clinicalCase = await prisma.clinicalCase.create({
    data: {
      clinicId: session.user.clinicId,
      createdById: session.user.id,
      title: data.title,
      summary: encrypt(data.summary),
      symptoms: encrypt(data.symptoms),
      rubrics: data.rubrics || null,
      repertorization: data.repertorization || null,
      prescribedRemedy: data.prescribedRemedy || null,
      potency: data.potency || null,
      outcome: data.outcome ? encrypt(data.outcome) : null,
      outcomeRating: data.outcomeRating || null,
      tags: data.tags || null,
      patientAge: data.patientAge || null,
      patientSex: data.patientSex || null,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.CLINICAL_CASE_NEW,
    details: `Caso clinico criado: ${data.title}`,
  });

  return NextResponse.json(decryptCase(clinicalCase), { status: 201 });
}
