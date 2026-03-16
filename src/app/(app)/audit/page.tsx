"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin-guard";
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
import { FileText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  action: string;
  details: string | null;
  timestamp: string;
  user: { name: string } | null;
}

const actionColors: Record<string, string> = {
  LOGIN: "bg-blue-500/20 text-blue-400",
  LOGOUT: "bg-gray-500/20 text-gray-400",
  PATIENT_NEW: "bg-teal-500/20 text-teal-400",
  PATIENT_EDIT: "bg-amber-500/20 text-amber-400",
  PATIENT_DELETE: "bg-red-500/20 text-red-400",
  CONSULTATION_NEW: "bg-indigo-500/20 text-indigo-400",
  CONSULTATION_EDIT: "bg-purple-500/20 text-purple-400",
  ANAMNESIS_SAVE: "bg-cyan-500/20 text-cyan-400",
  LGPD_CONSENT: "bg-green-500/20 text-green-400",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audit?page=${page}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page]);

  return (
    <AdminGuard>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="h-6 w-6 text-teal-400" />
        Trilha de Auditoria
      </h1>

      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">
            {total} registros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e2e]">
                <TableHead>Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-[#1e1e2e]">
                    <TableCell className="text-sm text-gray-400">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.action] || "bg-gray-500/20 text-gray-400"}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-300">
                      {log.details || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {log.user?.name || "Sistema"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </AdminGuard>
  );
}
