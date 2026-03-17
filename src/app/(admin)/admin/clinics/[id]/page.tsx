"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Save,
  Building2,
  Users,
  Power,
  Trash2,
  AlertTriangle,
  Calendar,
} from "lucide-react";
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

function toDateInputValue(date: string | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function AdminClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [clinic, setClinic] = useState<ClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSub, setSavingSub] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Limits form
  const [maxPatients, setMaxPatients] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [status, setStatus] = useState("");

  // Subscription form
  const [trialDate, setTrialDate] = useState("");
  const [periodDate, setPeriodDate] = useState("");
  const [planKey, setPlanKey] = useState("");
  const [applyPlanDefaults, setApplyPlanDefaults] = useState(true);

  // Delete clinic
  const [confirmName, setConfirmName] = useState("");

  const fetchClinic = useCallback(async () => {
    const res = await fetch(`/api/admin/clinics/${id}`);
    if (res.ok) {
      const data = await res.json();
      setClinic(data);
      setMaxPatients(String(data.maxPatients));
      setMaxUsers(String(data.maxUsersPerClinic));
      setStatus(data.subscriptionStatus);
      setTrialDate(toDateInputValue(data.trialEndsAt));
      setPeriodDate(toDateInputValue(data.currentPeriodEnd));
      setPlanKey(data.planKey);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchClinic();
  }, [fetchClinic]);

  async function handleSaveLimits() {
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
      toast.success("Limites atualizados!");
      fetchClinic();
    } else {
      toast.error("Erro ao atualizar limites");
    }
  }

  async function handleSaveSubscription() {
    setSavingSub(true);
    const body: Record<string, unknown> = {};
    if (trialDate !== toDateInputValue(clinic?.trialEndsAt ?? null)) {
      body.trialEndsAt = trialDate || null;
    }
    if (periodDate !== toDateInputValue(clinic?.currentPeriodEnd ?? null)) {
      body.currentPeriodEnd = periodDate || null;
    }
    if (planKey !== clinic?.planKey) {
      body.planKey = planKey;
      body.applyPlanDefaults = applyPlanDefaults;
    }

    if (Object.keys(body).length === 0) {
      toast.info("Nenhuma alteração detectada");
      setSavingSub(false);
      return;
    }

    const res = await fetch(`/api/admin/clinics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSavingSub(false);
    if (res.ok) {
      toast.success("Assinatura atualizada!");
      fetchClinic();
    } else {
      toast.error("Erro ao atualizar assinatura");
    }
  }

  async function handleDeleteClinic() {
    setDeleting(true);
    const res = await fetch(`/api/admin/clinics/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    setDeleting(false);
    if (res.ok) {
      toast.success("Clínica excluída com sucesso!");
      router.push("/admin");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Erro ao excluir clínica");
    }
  }

  async function handleToggleUser(userId: string, active: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      toast.success(active ? "Usuário ativado" : "Usuário desativado");
      fetchClinic();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Erro ao atualizar usuário");
    }
  }

  async function handleDeleteUser(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Usuário excluído");
      fetchClinic();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Erro ao excluir usuário");
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

      {/* Row 1: Info + Limits */}
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
              onClick={handleSaveLimits}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Limites"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Subscription Management */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-400" />
            Gerenciar Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trial */}
            <div className="space-y-3">
              <Label>Data de Fim do Trial</Label>
              <Input
                type="date"
                value={trialDate}
                onChange={(e) => setTrialDate(e.target.value)}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs"
                  onClick={() => setTrialDate(addDays(7))}
                >
                  +7 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs"
                  onClick={() => setTrialDate(addDays(14))}
                >
                  +14 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs"
                  onClick={() => setTrialDate(addDays(30))}
                >
                  +30 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs text-red-400"
                  onClick={() => setTrialDate("")}
                >
                  Limpar
                </Button>
              </div>
            </div>

            {/* Current Period */}
            <div className="space-y-3">
              <Label>Período Atual Expira</Label>
              <Input
                type="date"
                value={periodDate}
                onChange={(e) => setPeriodDate(e.target.value)}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs"
                  onClick={() => setPeriodDate(addDays(30))}
                >
                  +30 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs"
                  onClick={() => setPeriodDate(addDays(90))}
                >
                  +90 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs"
                  onClick={() => setPeriodDate(addDays(365))}
                >
                  +1 ano
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3a] text-xs text-red-400"
                  onClick={() => setPeriodDate("")}
                >
                  Limpar
                </Button>
              </div>
            </div>

            {/* Plan */}
            <div className="space-y-3">
              <Label>Plano</Label>
              <Select value={planKey} onValueChange={(v) => { if (v) setPlanKey(v); }}>
                <SelectTrigger className="bg-[#16161f] border-[#2a2a3a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito (10 pac / 1 usr)</SelectItem>
                  <SelectItem value="professional">Profissional (500 pac / 3 usr)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (ilimitado / 12 usr)</SelectItem>
                </SelectContent>
              </Select>
              {planKey !== clinic.planKey && (
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={applyPlanDefaults}
                    onChange={(e) => setApplyPlanDefaults(e.target.checked)}
                    className="rounded"
                  />
                  Aplicar limites padrão do plano
                </label>
              )}
            </div>
          </div>
          <Button
            onClick={handleSaveSubscription}
            disabled={savingSub}
            className="bg-teal-600 hover:bg-teal-700 mt-4"
          >
            <Save className="h-4 w-4 mr-2" />
            {savingSub ? "Salvando..." : "Salvar Assinatura"}
          </Button>
        </CardContent>
      </Card>

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
                <TableHead className="text-right">Ações</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUser(user.id, !user.active)}
                        title={user.active ? "Desativar" : "Ativar"}
                      >
                        <Power
                          className={`h-4 w-4 ${
                            user.active ? "text-green-400" : "text-gray-500"
                          }`}
                        />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          className="inline-flex items-center justify-center rounded-md text-sm h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#111118] border-[#1e1e2e]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir <strong>{user.name}</strong> ({user.email})?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#2a2a3a]">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[#111118] border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            Excluir esta clínica removerá <strong>permanentemente</strong> todos os dados
            incluindo pacientes, consultas, prontuários, documentos e usuários.
            Esta ação é <strong>irreversível</strong>.
          </p>
          <div className="space-y-2">
            <Label className="text-gray-400">
              Digite <strong className="text-red-400">{clinic.name}</strong> para confirmar:
            </Label>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={clinic.name}
              className="bg-[#16161f] border-[#2a2a3a]"
            />
          </div>
          {confirmName === clinic.name && (
          <AlertDialog>
            <AlertDialogTrigger
              className="inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Excluindo..." : "Excluir Clínica Permanentemente"}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#111118] border-[#1e1e2e]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">
                  Confirmar Exclusão
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a excluir a clínica <strong>{clinic.name}</strong> e todos
                  os seus dados ({clinic._count.patients} pacientes, {clinic.users.length} usuários,{" "}
                  {clinic._count.auditLogs} logs). Esta ação NÃO pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[#2a2a3a]">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClinic}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, Excluir Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
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
