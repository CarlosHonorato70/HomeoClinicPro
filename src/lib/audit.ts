/**
 * HomeoClinic Pro — Propriedade de Carlos Honorato
 * Protegido pela Lei 9.609/1998 (Lei do Software)
 * Todos os direitos reservados. Copia e distribuicao proibidas.
 */
import { prisma } from "./prisma";
import { headers } from "next/headers";

/**
 * Extract client IP from request headers (for use in API routes).
 */
export async function getClientIp(): Promise<string | undefined> {
  try {
    const hdrs = await headers();
    return (
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      undefined
    );
  } catch {
    return undefined;
  }
}

export const AuditActions = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PATIENT_NEW: "PATIENT_NEW",
  PATIENT_EDIT: "PATIENT_EDIT",
  PATIENT_DELETE: "PATIENT_DELETE",
  CONSULTATION_NEW: "CONSULTATION_NEW",
  CONSULTATION_EDIT: "CONSULTATION_EDIT",
  ANAMNESIS_SAVE: "ANAMNESIS_SAVE",
  LGPD_CONSENT: "LGPD_CONSENT",
  LGPD_REVOKE: "LGPD_REVOKE",
  EXPORT: "EXPORT",
  SETTINGS_SAVE: "SETTINGS_SAVE",
  LGPD_EXPORT: "LGPD_EXPORT",
  LGPD_ANONYMIZE: "LGPD_ANONYMIZE",
  LGPD_DELETE: "LGPD_DELETE",
  DOCUMENT_CREATE: "DOCUMENT_CREATE",
  DOCUMENT_VIEW: "DOCUMENT_VIEW",
  DOCUMENT_DELETE: "DOCUMENT_DELETE",
  APPOINTMENT_NEW: "APPOINTMENT_NEW",
  APPOINTMENT_EDIT: "APPOINTMENT_EDIT",
  APPOINTMENT_CANCEL: "APPOINTMENT_CANCEL",
  FINANCIAL_NEW: "FINANCIAL_NEW",
  SUPERADMIN_TRIAL_CHANGE: "SUPERADMIN_TRIAL_CHANGE",
  SUPERADMIN_PLAN_CHANGE: "SUPERADMIN_PLAN_CHANGE",
  SUPERADMIN_LIMITS_CHANGE: "SUPERADMIN_LIMITS_CHANGE",
  SUPERADMIN_USER_DEACTIVATE: "SUPERADMIN_USER_DEACTIVATE",
  SUPERADMIN_USER_DELETE: "SUPERADMIN_USER_DELETE",
  SUPERADMIN_CLINIC_DELETE: "SUPERADMIN_CLINIC_DELETE",
  CLINICAL_CASE_NEW: "CLINICAL_CASE_NEW",
  CLINICAL_CASE_EDIT: "CLINICAL_CASE_EDIT",
  CLINICAL_CASE_DELETE: "CLINICAL_CASE_DELETE",
  PATIENT_EXPORT: "PATIENT_EXPORT",
  PATIENT_IMPORT: "PATIENT_IMPORT",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

export async function logAudit(params: {
  clinicId: string;
  userId?: string;
  action: AuditAction;
  details?: string;
  ip?: string;
}) {
  // Auto-capture IP if not provided
  const ip = params.ip || (await getClientIp());

  await prisma.auditLog.create({
    data: {
      clinicId: params.clinicId,
      userId: params.userId,
      action: params.action,
      details: params.details,
      ip,
    },
  });
}
