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
      rg: tryDecrypt(patient.rg),
      birthDate: patient.birthDate,
      sex: patient.sex,
      phone: tryDecrypt(patient.phone),
      email: tryDecrypt(patient.email),
      address: tryDecrypt(patient.address),
      profession: tryDecrypt(patient.profession),
      insurance: tryDecrypt(patient.insurance),
      notes: tryDecrypt(patient.notes),
      lgpdConsent: patient.lgpdConsent,
      lgpdConsentDate: patient.lgpdConsentDate,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    },
    consultations: patient.consultations.map((c) => ({
      date: c.date,
      complaint: tryDecrypt(c.complaint),
      anamnesis: tryDecrypt(c.anamnesis),
      physicalExam: tryDecrypt(c.physicalExam),
      diagnosis: tryDecrypt(c.diagnosis),
      repertorialSymptoms: c.repertorialSymptoms,
      prescription: tryDecrypt(c.prescription),
      evolution: c.evolution,
      createdAt: c.createdAt,
    })),
    anamnesis: patient.anamnesis
      ? {
          mental: tryDecrypt(patient.anamnesis.mental),
          general: tryDecrypt(patient.anamnesis.general),
          desires: tryDecrypt(patient.anamnesis.desires),
          sleep: tryDecrypt(patient.anamnesis.sleep),
          perspiration: tryDecrypt(patient.anamnesis.perspiration),
          thermoregulation: tryDecrypt(patient.anamnesis.thermoregulation),
          gyneco: tryDecrypt(patient.anamnesis.gyneco),
          particular: tryDecrypt(patient.anamnesis.particular),
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
