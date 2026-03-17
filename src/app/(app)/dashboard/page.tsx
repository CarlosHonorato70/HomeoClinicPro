"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Stethoscope,
  CalendarDays,
  Activity,
  TrendingUp,
  Clock,
  UserPlus,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface DashboardStats {
  cards: {
    totalPatients: number;
    consultationsThisMonth: number;
    appointmentsToday: number;
    consultationsToday: number;
    returnRate: number;
  };
  consultationsByMonth: { month: string; count: number }[];
  patientsByMonth: { month: string; count: number }[];
  todayAppointments: {
    id: string;
    time: string;
    patientName: string;
    type: string;
    status: string;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#111118] border-[#1e1e2e] animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-[#1e1e2e] rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Pacientes",
      value: stats.cards.totalPatients,
      icon: Users,
      color: "text-teal-400",
      bg: "bg-teal-400/10",
    },
    {
      label: "Consultas este mês",
      value: stats.cards.consultationsThisMonth,
      icon: Stethoscope,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      label: "Agendamentos hoje",
      value: stats.cards.appointmentsToday,
      icon: CalendarDays,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Taxa de retorno",
      value: `${stats.cards.returnRate}%`,
      icon: Percent,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations per Month */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Consultas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.consultationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={{ stroke: "#1e1e2e" }}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={{ stroke: "#1e1e2e" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e2e",
                      border: "1px solid #2a2a3a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [String(value), "Consultas"]}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Patients per Month */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-teal-400" />
              Novos Pacientes por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.patientsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={{ stroke: "#1e1e2e" }}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={{ stroke: "#1e1e2e" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e2e",
                      border: "1px solid #2a2a3a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [String(value), "Pacientes"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    dot={{ fill: "#2dd4bf", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-amber-400" />
            Agenda de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            <div className="space-y-2">
              {stats.todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-mono font-semibold text-teal-400 w-16">
                      {apt.time}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{apt.patientName}</p>
                      <p className="text-xs text-gray-500">{apt.type || "Consulta"}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === "scheduled"
                        ? "bg-blue-500/10 text-blue-400"
                        : apt.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {apt.status === "scheduled"
                      ? "Agendado"
                      : apt.status === "completed"
                        ? "Concluído"
                        : apt.status === "cancelled"
                          ? "Cancelado"
                          : apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
