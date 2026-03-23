import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditActions } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  // Fetch the consent and verify it belongs to a patient in the clinic
  const consent = await prisma.lgpdConsent.findUnique({
    where: { id },
    include: { patient: { select: { clinicId: true, name: true } } },
  });

  if (!consent || consent.patient.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Consent not found" }, { status: 404 });
  }

  if (consent.revokedDate) {
    return NextResponse.json({ error: "Consent already revoked" }, { status: 400 });
  }

  const updated = await prisma.lgpdConsent.update({
    where: { id },
    data: {
      granted: false,
      revokedDate: new Date(),
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.LGPD_REVOKE,
    details: `Consentimento ${consent.consentType} revogado para paciente ${consent.patient.name}`,
  });

  return NextResponse.json(updated);
}
