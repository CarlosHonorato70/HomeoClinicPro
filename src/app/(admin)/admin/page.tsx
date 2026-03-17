"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  UserCheck,
  CreditCard,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface Overview {
  totalClinics: number;
  totalUsers: number;
  totalPatients: number;
  activeSubscriptions: number;
  trialingClinics: number;
  canceledClinics: number;
}

interface ClinicItem {
  id: string;
  name: string;
  email: string | null;
  plan: string;
  planKey: string;
  status: string;
  usersCount: number;
  patientsCount: number;
  maxUsers: number;
  maxPatients: number;
  trialEndsAt: string | null;
  createdAt: string;
}

interface Alert {
  clinicId: string;
  clinicName: string;
  type: string;
  message: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  trialing: { label: "Trial", className: "bg-amber-600 hover:bg-amber-700" },
  active: { label: "Ativa", className: "bg-green-600 hover:bg-green-700" },
  canceled: { label: "Cancelada", className: "bg-red-600 hover:bg-red-700" },
  past_due: { label: "Pendente", className: "bg-orange-600 hover:bg-orange-700" },
};

const planConfig: Record<string, { className: string }> = {
  free: { className: "bg-gray-600 hover:bg-gray-700" },
  professional: { className: "bg-teal-600 hover:bg-teal-700" },
  enterprise: { className: "bg-purple-600 hover:bg-purple-700" },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((data) => {
        setOverview(data.overview);
        setClinics(data.clinics);
        setAlerts(data.alerts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Carregando painel administrativo...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCard
            title="Clínicas"
            value={overview.totalClinics}
            icon={Building2}
            subtitle={`${overview.trialingClinics} em trial`}
          />
          <OverviewCard
            title="Usuários"
            value={overview.totalUsers}
            icon={Users}
            subtitle="Total na plataforma"
          />
          <OverviewCard
            title="Pacientes"
            value={overview.totalPatients}
            icon={UserCheck}
            subtitle="Total na plataforma"
          />
          <OverviewCard
            title="Assinaturas Ativas"
            value={overview.activeSubscriptions}
            icon={CreditCard}
            subtitle={`${overview.canceledClinics} cancelada(s)`}
          />
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-[#111118] border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#0d0d14] rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      alert.type === "expired_trial"
                        ? "bg-amber-600"
                        : alert.type === "users_exceeded"
                        ? "bg-red-600"
                        : "bg-orange-600"
                    }
                  >
                    {alert.type === "expired_trial"
                      ? "Trial Expirado"
                      : alert.type === "users_exceeded"
                      ? "Limite Excedido"
                      : "Uso Alto"}
                  </Badge>
                  <span className="text-sm">
                    <strong>{alert.clinicName}</strong> — {alert.message}
                  </span>
                </div>
                <Link
                  href={`/admin/clinics/${alert.clinicId}`}
                  className="text-teal-400 hover:text-teal-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Clinics Table */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle>Clínicas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e2e]">
                <TableHead>Clínica</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Usuários</TableHead>
                <TableHead className="text-center">Pacientes</TableHead>
                <TableHead>Trial Expira</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => {
                const status = statusConfig[clinic.status] || {
                  label: clinic.status,
                  className: "bg-gray-600",
                };
                const plan = planConfig[clinic.planKey] || { className: "bg-gray-600" };

                return (
                  <TableRow key={clinic.id} className="border-[#1e1e2e]">
                    <TableCell>
                      <div>
                        <p className="font-medium">{clinic.name}</p>
                        {clinic.email && (
                          <p className="text-xs text-gray-500">{clinic.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={plan.className}>{clinic.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          clinic.maxUsers !== -1 && clinic.usersCount >= clinic.maxUsers
                            ? "text-red-400 font-bold"
                            : ""
                        }
                      >
                        {clinic.usersCount}
                        {clinic.maxUsers !== -1 && `/${clinic.maxUsers}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          clinic.maxPatients !== -1 &&
                          clinic.patientsCount >= clinic.maxPatients
                            ? "text-red-400 font-bold"
                            : ""
                        }
                      >
                        {clinic.patientsCount}
                        {clinic.maxPatients !== -1 && `/${clinic.maxPatients}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {clinic.trialEndsAt ? formatDate(clinic.trialEndsAt) : "—"}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {formatDate(clinic.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/clinics/${clinic.id}`}
                        className="text-teal-400 hover:text-teal-300 text-sm"
                      >
                        Detalhes
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  subtitle: string;
}) {
  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-teal-600/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-teal-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
