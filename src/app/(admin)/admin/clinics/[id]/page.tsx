"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Save, Building2, Users } from "lucide-react";
import { toast } from "sonner";

interface ClinicDetail {
  id: string;
  name: string;
  email: string | null;
  cnpj: string | null;
  phone: string | null;
  subscriptionStatus: string;
  stripePriceId: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  maxPatients: number;
  maxUsersPerClinic: number;
  createdAt: string;
  plan: string;
  planKey: string;
  planLimits: {
    maxPatients: number;
    maxUsers: number;
    maxConsultationsPerMonth: number;
  };
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
  }[];
  _count: {
    patients: number;
    auditLogs: number;
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [clinic, setClinic] = useState<ClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [maxPatients, setMaxPatients] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [status, setStatus] = useState("");

  const fetchClinic = useCallback(async () => {
    const res = await fetch(`/api/admin/clinics/${id}`);
    if (res.ok) {
      const data = await res.json();
      setClinic(data);
      setMaxPatients(String(data.maxPatients));
      setMaxUsers(String(data.maxUsersPerClinic));
      setStatus(data.subscriptionStatus);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchClinic();
  }, [fetchClinic]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/clinics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maxPatients: Number(maxPatients),
        maxUsersPerClinic: Number(maxUsers),
        subscriptionStatus: status,
      }),
    });
    setSaving(false);

    if (res.ok) {
      toast.success("Clínica atualizada com sucesso!");
      fetchClinic();
    } else {
      toast.error("Erro ao atualizar clínica");
    }
  }

  if (loading) return <div className="text-gray-500">Carregando...</div>;
  if (!clinic) return <div className="text-gray-500">Clínica não encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-teal-400" />
          {clinic.name}
        </h1>
        <Badge
          className={
            clinic.subscriptionStatus === "active"
              ? "bg-green-600"
              : clinic.subscriptionStatus === "trialing"
              ? "bg-amber-600"
              : "bg-red-600"
          }
        >
          {clinic.subscriptionStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinic Info */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="ID" value={clinic.id} />
            <InfoRow label="Email" value={clinic.email || "—"} />
            <InfoRow label="CNPJ" value={clinic.cnpj || "—"} />
            <InfoRow label="Telefone" value={clinic.phone || "—"} />
            <InfoRow label="Plano" value={`${clinic.plan} (${clinic.planKey})`} />
            <InfoRow label="Criada em" value={formatDate(clinic.createdAt)} />
            <InfoRow
              label="Trial expira"
              value={clinic.trialEndsAt ? formatDate(clinic.trialEndsAt) : "—"}
            />
            <InfoRow
              label="Período atual"
              value={clinic.currentPeriodEnd ? formatDate(clinic.currentPeriodEnd) : "—"}
            />
            <InfoRow label="Pacientes" value={`${clinic._count.patients}`} />
            <InfoRow label="Logs de auditoria" value={`${clinic._count.auditLogs}`} />
          </CardContent>
        </Card>

        {/* Adjust Limits */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle>Ajustar Limites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Máximo de Pacientes</Label>
              <Input
                type="number"
                value={maxPatients}
                onChange={(e) => setMaxPatients(e.target.value)}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
              <p className="text-xs text-gray-500">
                Limite do plano: {clinic.planLimits.maxPatients === -1 ? "Ilimitado" : clinic.planLimits.maxPatients}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Máximo de Usuários</Label>
              <Input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
              <p className="text-xs text-gray-500">
                Limite do plano: {clinic.planLimits.maxUsers === -1 ? "Ilimitado" : clinic.planLimits.maxUsers}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status da Assinatura</Label>
              <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
                <SelectTrigger className="bg-[#16161f] border-[#2a2a3a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-400" />
            Usuários ({clinic.users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e2e]">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinic.users.map((user) => (
                <TableRow key={user.id} className="border-[#1e1e2e]">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-400">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-purple-600"
                          : "bg-blue-600"
                      }
                    >
                      {user.role === "admin" ? "Admin" : "Médico"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={user.active ? "bg-green-600" : "bg-gray-600"}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}
