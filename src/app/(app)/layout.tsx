import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { isSuperAdmin } from "@/lib/superadmin";
import { SupportChat } from "@/components/support-chat";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell
      user={session.user}
      isSuperAdmin={isSuperAdmin(session.user.email)}
      userRole={session.user.role}
    >
      {children}
      <SupportChat />
    </AppShell>
  );
}
