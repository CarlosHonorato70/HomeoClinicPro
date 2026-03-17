import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

function csvSafe(value: string | null | undefined): string {
  if (!value) return "";
  const str = String(value);
  // Prevent CSV formula injection
  if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId, deletedAt: null },
    orderBy: { name: "asc" },
  });

  const headers = [
    "Nome", "CPF", "RG", "Data Nascimento", "Sexo", "Telefone",
    "Email", "Endereco", "Profissao", "Convenio", "Notas",
    "Consentimento LGPD", "Data Cadastro",
  ];

  const rows = patients.map((p) => [
    csvSafe(p.name),
    csvSafe(tryDecrypt(p.cpf)),
    csvSafe(tryDecrypt(p.rg)),
    p.birthDate ? new Date(p.birthDate).toLocaleDateString("pt-BR") : "",
    csvSafe(p.sex),
    csvSafe(tryDecrypt(p.phone)),
    csvSafe(tryDecrypt(p.email)),
    csvSafe(tryDecrypt(p.address)),
    csvSafe(tryDecrypt(p.profession)),
    csvSafe(tryDecrypt(p.insurance)),
    csvSafe(tryDecrypt(p.notes)),
    p.lgpdConsent ? "Sim" : "Nao",
    p.createdAt ? new Date(p.createdAt).toLocaleDateString("pt-BR") : "",
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_EDIT,
    details: `Exportacao CSV de ${patients.length} pacientes`,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pacientes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
