import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";
import { checkPatientLimit } from "@/lib/subscription";
import Papa from "papaparse";

interface CsvRow {
  [key: string]: string;
}

// Map common CSV column names to our fields
const COLUMN_MAP: Record<string, string> = {
  nome: "name",
  name: "name",
  cpf: "cpf",
  rg: "rg",
  "data nascimento": "birthDate",
  "data_nascimento": "birthDate",
  birthdate: "birthDate",
  nascimento: "birthDate",
  sexo: "sex",
  sex: "sex",
  telefone: "phone",
  phone: "phone",
  tel: "phone",
  email: "email",
  endereco: "address",
  "endereço": "address",
  address: "address",
  profissao: "profession",
  "profissão": "profession",
  profession: "profession",
  convenio: "insurance",
  "convênio": "insurance",
  insurance: "insurance",
  notas: "notes",
  notes: "notes",
  observacoes: "notes",
  "observações": "notes",
};

function normalizeColumn(col: string): string {
  const lower = col.toLowerCase().trim();
  return COLUMN_MAP[lower] || lower;
}

function parseDateBR(value: string): Date | null {
  if (!value) return null;
  // Try DD/MM/YYYY
  const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    return new Date(parseInt(brMatch[3]), parseInt(brMatch[2]) - 1, parseInt(brMatch[1]));
  }
  // Try YYYY-MM-DD
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Arquivo CSV obrigatorio" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => normalizeColumn(h),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json({
      error: "Erro ao processar CSV",
      details: parsed.errors.slice(0, 5).map((e) => e.message),
    }, { status: 400 });
  }

  const clinicId = session.user.clinicId;
  const results = { imported: 0, errors: [] as { row: number; error: string }[] };

  // Check patient limit
  try {
    await checkPatientLimit(clinicId);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 403 });
  }

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const rowNum = i + 2; // +2 because header is row 1, and 0-indexed

    try {
      const name = row.name?.trim();
      if (!name) {
        results.errors.push({ row: rowNum, error: "Nome obrigatorio" });
        continue;
      }

      const cpf = row.cpf?.trim().replace(/\D/g, "") || null;

      // Check CPF duplicates
      if (cpf) {
        const existing = await prisma.patient.findFirst({
          where: { clinicId, cpf: encrypt(cpf), deletedAt: null },
        });
        if (existing) {
          results.errors.push({ row: rowNum, error: `CPF ${cpf} ja cadastrado` });
          continue;
        }
      }

      const birthDate = parseDateBR(row.birthDate || "");

      await prisma.patient.create({
        data: {
          clinicId,
          name,
          cpf: cpf ? encrypt(cpf) : null,
          rg: row.rg ? encrypt(row.rg.trim()) : null,
          birthDate,
          sex: row.sex?.trim().toUpperCase().charAt(0) === "M" ? "M" : row.sex?.trim().toUpperCase().charAt(0) === "F" ? "F" : null,
          phone: row.phone ? encrypt(row.phone.trim()) : null,
          email: row.email?.trim() || null,
          address: row.address ? encrypt(row.address.trim()) : null,
          profession: row.profession ? encrypt(row.profession.trim()) : null,
          insurance: row.insurance ? encrypt(row.insurance.trim()) : null,
          notes: row.notes ? encrypt(row.notes.trim()) : null,
          lgpdConsent: false,
        },
      });

      results.imported++;
    } catch (err) {
      results.errors.push({ row: rowNum, error: `Erro interno: ${(err as Error).message?.slice(0, 100)}` });
    }
  }

  await logAudit({
    clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_NEW || "PATIENT_IMPORT",
    details: `Importacao CSV: ${results.imported} importados, ${results.errors.length} erros`,
  });

  return NextResponse.json(results);
}
