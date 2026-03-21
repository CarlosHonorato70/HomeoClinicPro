// Role-Based Access Control (RBAC) for HomeoClinic Pro

export const PERMISSIONS = [
  "manage_clinic",
  "manage_users",
  "manage_billing",
  "view_financial",
  "manage_financial",
  "view_audit",
  "view_patients",
  "manage_patients",
  "manage_consultations",
  "view_repertory",
  "manage_agenda",
  "manage_documents",
  "view_lgpd",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [...PERMISSIONS],
  doctor: [
    "view_patients",
    "manage_patients",
    "manage_consultations",
    "view_repertory",
    "manage_agenda",
    "manage_documents",
  ],
  secretary: [
    "view_patients",
    "manage_agenda",
    "view_financial",
  ],
  intern: [
    "view_patients",
    "view_repertory",
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission as Permission);
}

export function requirePermission(
  session: { user: { role: string } },
  permission: string
): void {
  if (!hasPermission(session.user.role, permission)) {
    throw new Error(
      `Permissão negada: ${permission} não disponível para o perfil ${session.user.role}`
    );
  }
}
