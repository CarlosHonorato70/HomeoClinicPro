import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, FileText, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [patientCount, consultationCount, recentLogs] = await Promise.all([
    prisma.patient.count({ where: { clinicId: session.user.clinicId } }),
    prisma.consultation.count({
      where: { patient: { clinicId: session.user.clinicId } },
    }),
    prisma.auditLog.findMany({
      where: { clinicId: session.user.clinicId },
      include: { user: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: "Pacientes", value: patientCount, icon: Users, color: "text-teal-400" },
    { label: "Consultas", value: consultationCount, icon: Stethoscope, color: "text-indigo-400" },
    { label: "Auditoria", value: recentLogs.length, icon: FileText, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-400" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma atividade registrada.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-teal-400 mr-2">
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-400">
                      {log.details}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {log.user?.name} &middot; {formatDateTime(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
