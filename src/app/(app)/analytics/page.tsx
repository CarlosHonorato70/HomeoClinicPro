"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Users,
  Stethoscope,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

interface ClinicalData {
  totalConsultations: number;
  totalPatients: number;
  consultationsByMonth: { month: string; count: number }[];
  prescriptionCount: number;
}

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  revenueByMonth: { month: string; total: number }[];
}

interface OperationalData {
  totalAppointments: number;
  completedRate: number;
  noShowRate: number;
  cancelledRate: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "text-primary",
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [clinical, setClinical] = useState<ClinicalData | null>(null);
  const [financial, setFinancial] = useState<FinancialData | null>(null);
  const [operational, setOperational] = useState<OperationalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/clinical").then((r) => r.json()),
      fetch("/api/analytics/financial").then((r) => r.json()),
      fetch("/api/analytics/operational").then((r) => r.json()),
    ])
      .then(([c, f, o]) => {
        setClinical(c);
        setFinancial(f);
        setOperational(o);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão geral dos últimos 30 dias
        </p>
      </div>

      <Tabs defaultValue="clinical">
        <TabsList>
          <TabsTrigger value="clinical">Clínico</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pacientes"
              value={String(clinical?.totalPatients || 0)}
              icon={Users}
              color="text-blue-500"
            />
            <StatCard
              title="Consultas"
              value={String(clinical?.totalConsultations || 0)}
              icon={Stethoscope}
              color="text-teal-500"
            />
            <StatCard
              title="Prescrições"
              value={String(clinical?.prescriptionCount || 0)}
              icon={Activity}
              color="text-purple-500"
            />
            <StatCard
              title="Média/mês"
              value={
                clinical?.consultationsByMonth.length
                  ? String(
                      Math.round(
                        clinical.totalConsultations /
                          clinical.consultationsByMonth.length
                      )
                    )
                  : "0"
              }
              icon={BarChart}
              color="text-amber-500"
            />
          </div>

          {clinical?.consultationsByMonth && clinical.consultationsByMonth.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Consultas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {clinical.consultationsByMonth.map((m) => {
                    const maxCount = Math.max(
                      ...clinical.consultationsByMonth.map((x) => x.count)
                    );
                    const height = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={m.month}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {m.count}
                        </span>
                        <div
                          className="w-full bg-teal-500 rounded-t"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {m.month.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Receita"
              value={`R$ ${(financial?.totalIncome || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              color="text-green-500"
            />
            <StatCard
              title="Despesas"
              value={`R$ ${(financial?.totalExpenses || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingDown}
              color="text-red-500"
            />
            <StatCard
              title="Lucro Líquido"
              value={`R$ ${(financial?.netProfit || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              color={(financial?.netProfit || 0) >= 0 ? "text-green-500" : "text-red-500"}
            />
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Agendamentos"
              value={String(operational?.totalAppointments || 0)}
              icon={Calendar}
              color="text-blue-500"
            />
            <StatCard
              title="Taxa Realização"
              value={`${Math.round(operational?.completedRate || 0)}%`}
              icon={Activity}
              color="text-green-500"
            />
            <StatCard
              title="No-Show"
              value={`${operational?.noShowRate || 0}%`}
              icon={Users}
              color="text-amber-500"
            />
            <StatCard
              title="Cancelamentos"
              value={`${Math.round(operational?.cancelledRate || 0)}%`}
              icon={TrendingDown}
              color="text-red-500"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
