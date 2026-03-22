"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Menu, X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
  isSuperAdmin: boolean;
  userRole: string;
}

export function AppShell({ children, user, isSuperAdmin, userRole }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar isSuperAdmin={isSuperAdmin} userRole={userRole} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3 z-10 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e1e2e]"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar isSuperAdmin={isSuperAdmin} userRole={userRole} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-[#0d0d14] border-b border-[#1e1e2e] flex items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e1e2e]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <Header user={user} />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
