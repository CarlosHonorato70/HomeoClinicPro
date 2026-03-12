import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId } = await params;

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.user.clinicId },
    include: {
      consultations: {
        orderBy: { date: "desc" },
      },
      anamnesis: true,
      lgpdConsents: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    exportType: "LGPD Art. 18 - Portabilidade de Dados",
    patient: {
      name: patient.name,
      cpf: tryDecrypt(patient.cpf),
      rg: patient.rg,
      birthDate: patient.birthDate,
      sex: patient.sex,
      phone: tryDecrypt(patient.phone),
      email: tryDecrypt(patient.email),
      address: patient.address,
      profession: patient.profession,
      insurance: patient.insurance,
      notes: patient.notes,
      lgpdConsent: patient.lgpdConsent,
      lgpdConsentDate: patient.lgpdConsentDate,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    },
    consultations: patient.consultations.map((c) => ({
      date: c.date,
      complaint: c.complaint,
      anamnesis: c.anamnesis,
      physicalExam: c.physicalExam,
      diagnosis: c.diagnosis,
      repertorialSymptoms: c.repertorialSymptoms,
      prescription: c.prescription,
      evolution: c.evolution,
      createdAt: c.createdAt,
    })),
    anamnesis: patient.anamnesis
      ? {
          mental: patient.anamnesis.mental,
          general: patient.anamnesis.general,
          desires: patient.anamnesis.desires,
          sleep: patient.anamnesis.sleep,
          perspiration: patient.anamnesis.perspiration,
          thermoregulation: patient.anamnesis.thermoregulation,
          gyneco: patient.anamnesis.gyneco,
          particular: patient.anamnesis.particular,
          updatedAt: patient.anamnesis.updatedAt,
        }
      : null,
    consents: patient.lgpdConsents.map((c) => ({
      consentType: c.consentType,
      granted: c.granted,
      date: c.date,
      revokedDate: c.revokedDate,
    })),
  };

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.LGPD_EXPORT,
    details: `Exportação LGPD de dados do paciente: ${patient.name}`,
  });

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="patient-data-export.json"',
    },
  });
}
