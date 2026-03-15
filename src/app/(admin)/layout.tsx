import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/superadmin";
import Link from "next/link";
import { Stethoscope, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !isSuperAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <header className="border-b border-[#1e1e2e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-6 w-6 text-teal-500" />
          <span className="text-lg font-bold">
            Homeo<span className="text-teal-500">Clinic</span>{" "}
            <span className="text-amber-400">Admin</span>
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao App
        </Link>
      </header>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
