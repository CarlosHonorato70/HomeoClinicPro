import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditActions } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    requirePermission(session, "view_lgpd");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;

  // Verify patient belongs to the clinic
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.user.clinicId },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  // Anonymize PII but keep clinical data for 20-year retention (CFM requirement)
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: "ANONIMIZADO",
      cpf: null,
      rg: null,
      phone: null,
      email: null,
      address: null,
      profession: null,
      insurance: null,
      notes: null,
      lgpdConsent: false,
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.LGPD_ANONYMIZE,
    details: `Dados do paciente ID ${patientId} anonimizados. Dados clínicos mantidos conforme retenção CFM de 20 anos.`,
  });

  return NextResponse.json({
    message: "Dados do paciente anonimizados com sucesso. Dados clínicos mantidos conforme exigência do CFM (20 anos).",
  });
}
