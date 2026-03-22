"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Stethoscope,
  CalendarDays,
  TrendingUp,
  Clock,
  UserPlus,
  Percent,
  Pill,
  CheckCircle,
  DollarSign,
  BookMarked,
  BarChart3,
  Heart,
  Activity,
  Star,
  CalendarRange,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  cards: {
    totalPatients: number;
    consultationsThisMonth: number;
    appointmentsToday: number;
    consultationsToday: number;
    returnRate: number;
    completionRate: number;
    avgConsPerPatient: number;
    totalClinicalCases: number;
    improvementRate: number;
    activePatients: number;
  };
  consultationsByMonth: { month: string; count: number }[];
  patientsByMonth: { month: string; count: number }[];
  topRemedies: { name: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
  consByDoctor: { name: string; count: number }[];
  outcomeDistribution: { name: string; rating: number; count: number }[];
  upcomingAppointments: {
    id: string;
    date: string;
    time: string;
    patientName: string;
    type: string;
    status: string;
  }[];
  todayAppointments: {
    id: string;
    time: string;
    patientName: string;
    type: string;
    status: string;
  }[];
}

const PIE_COLORS = [
  "#2dd4bf", "#818cf8", "#f59e0b", "#ef4444", "#10b981",
  "#8b5cf6", "#f97316", "#06b6d4", "#ec4899", "#84cc16",
];

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
          {[...Array(8)].map((_, i) => (
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
    { label: "Pacientes", value: stats.cards.totalPatients, icon: Users, color: "text-teal-400", bg: "bg-teal-400/10" },
    { label: "Consultas este mês", value: stats.cards.consultationsThisMonth, icon: Stethoscope, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { label: "Agendamentos hoje", value: stats.cards.appointmentsToday, icon: CalendarDays, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Taxa de retorno", value: `${stats.cards.returnRate}%`, icon: Percent, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Agendamentos concluídos", value: `${stats.cards.completionRate}%`, icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Média consultas/paciente", value: stats.cards.avgConsPerPatient, icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Casos clínicos", value: stats.cards.totalClinicalCases, icon: BookMarked, color: "text-rose-400", bg: "bg-rose-400/10" },
    { label: "Taxa de melhora", value: `${stats.cards.improvementRate}%`, icon: Heart, color: stats.cards.improvementRate >= 70 ? "text-green-400" : stats.cards.improvementRate >= 40 ? "text-amber-400" : "text-red-400", bg: stats.cards.improvementRate >= 70 ? "bg-green-400/10" : stats.cards.improvementRate >= 40 ? "bg-amber-400/10" : "bg-red-400/10" },
    { label: "Pacientes ativos", value: stats.cards.activePatients, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-400/10" },
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

      {/* Charts Row 1 */}
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
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: "8px", color: "#fff" }} formatter={(value) => [String(value), "Consultas"]} />
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
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: "8px", color: "#fff" }} formatter={(value) => [String(value), "Pacientes"]} />
                  <Line type="monotone" dataKey="count" stroke="#2dd4bf" strokeWidth={2} dot={{ fill: "#2dd4bf", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Remedies Pie Chart */}
        {stats.topRemedies.length > 0 && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-5 w-5 text-teal-400" />
                Top 10 Remédios Prescritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topRemedies}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                    >
                      {stats.topRemedies.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: "8px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[40%] space-y-1.5 pl-2">
                  {stats.topRemedies.map((r, idx) => (
                    <div key={r.name} className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-gray-300 truncate">{r.name}</span>
                      <span className="text-gray-500 ml-auto">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue by Month */}
        {stats.revenueByMonth.some((r) => r.amount > 0) && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: "8px", color: "#fff" }} formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Receita"]} />
                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consultations by Doctor */}
        {stats.consByDoctor.length > 1 && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-5 w-5 text-purple-400" />
                Consultas por Médico (6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.consByDoctor} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={{ stroke: "#1e1e2e" }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: "8px", color: "#fff" }} formatter={(value) => [String(value), "Consultas"]} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Outcome Distribution + Upcoming 7 Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Distribution */}
        {stats.outcomeDistribution && stats.outcomeDistribution.length > 0 && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-5 w-5 text-amber-400" />
                Resultados dos Casos Clínicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center">
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.outcomeDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                    >
                      {stats.outcomeDistribution.map((_, idx) => {
                        const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#2dd4bf"];
                        return <Cell key={idx} fill={colors[idx % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: "8px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[45%] space-y-2 pl-2">
                  {stats.outcomeDistribution.map((r, idx) => {
                    const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#2dd4bf"];
                    return (
                      <div key={r.name} className="flex items-center gap-2 text-xs">
                        <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                        <span className="text-gray-300 truncate">{r.name}</span>
                        <span className="text-gray-500 ml-auto">{r.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming 7 Days */}
        {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarRange className="h-5 w-5 text-indigo-400" />
                Próximos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {stats.upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center w-12">
                        <p className="text-xs text-gray-500">
                          {new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </p>
                        <p className="text-sm font-mono font-semibold text-indigo-400">{apt.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{apt.patientName}</p>
                        <p className="text-xs text-gray-500">
                          {apt.type === "teleconsulta" ? "Teleconsulta" : "Consulta"}
                        </p>
                      </div>
                    </div>
                    {apt.type === "teleconsulta" && (
                      <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">
                        Online
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
                      <p className="text-xs text-gray-500">{apt.type === "teleconsulta" ? "📹 Teleconsulta" : apt.type || "Consulta"}</p>
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
                        ? "Concluido"
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
