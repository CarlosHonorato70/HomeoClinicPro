"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  Settings,
  Stethoscope,
  BookOpen,
  Calendar,
  DollarSign,
  CreditCard,
  UsersRound,
  Pill,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "PRINCIPAL",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "CLÍNICA",
    items: [
      { href: "/patients", icon: Users, label: "Pacientes" },
      { href: "/repertory", icon: BookOpen, label: "Repertório" },
      { href: "/repertory/remedies", icon: Pill, label: "Remédios" },
      { href: "/agenda", icon: Calendar, label: "Agenda" },
      { href: "/ai", icon: Sparkles, label: "Assistente IA" },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { href: "/financial", icon: DollarSign, label: "Financeiro", adminOnly: true },
      { href: "/audit", icon: FileText, label: "Auditoria", adminOnly: true },
      { href: "/lgpd", icon: Shield, label: "LGPD", adminOnly: true },
      { href: "/settings", icon: Settings, label: "Configurações", adminOnly: true },
      { href: "/settings/billing", icon: CreditCard, label: "Assinatura", adminOnly: true },
      { href: "/settings/team", icon: UsersRound, label: "Equipe", adminOnly: true },
    ],
  },
];

interface SidebarProps {
  isSuperAdmin?: boolean;
  userRole?: string;
}

export function Sidebar({ isSuperAdmin = false, userRole = "admin" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col">
      <div className="p-4 border-b border-[#1e1e2e]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-teal-500" />
          <span className="text-lg font-bold">
            Homeo<span className="text-teal-500">Clinic</span> Pro
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-6">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.adminOnly || userRole === "admin"
          );
          if (visibleItems.length === 0) return null;
          return (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-500 mb-2 px-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-teal-500/10 text-teal-400"
                        : "text-gray-400 hover:text-white hover:bg-[#16161f]"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {isSuperAdmin && (
        <div className="px-3 pb-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-3">
            PLATAFORMA
          </p>
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith("/admin")
                ? "bg-amber-500/10 text-amber-400"
                : "text-gray-400 hover:text-white hover:bg-[#16161f]"
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        </div>
      )}

      <div className="p-4 border-t border-[#1e1e2e]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3 text-teal-500" />
          <span>LGPD Compliant</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">v1.0.0</p>
      </div>
    </aside>
  );
}
