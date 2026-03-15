/**
 * Platform-level superadmin helpers.
 * Uses SUPERADMIN_EMAILS env var (comma-separated) to whitelist platform admins.
 * No schema changes needed — purely env-var driven.
 */

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export function requireSuperAdmin(session: {
  user: { email?: string | null };
}): void {
  if (!isSuperAdmin(session.user.email)) {
    throw new Error("Acesso negado: permissão de superadmin necessária");
  }
}
