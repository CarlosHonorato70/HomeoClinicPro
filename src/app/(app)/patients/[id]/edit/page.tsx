"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, UserCog } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface PatientData {
  name: string;
  cpf: string | null;
  rg: string | null;
  birthDate: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  profession: string | null;
  insurance: string | null;
  notes: string | null;
  lgpdConsent: boolean;
}

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<PatientData | null>(null);

  const fetchPatient = useCallback(async () => {
    const res = await fetch(`/api/patients/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPatient({
        name: data.name || "",
        cpf: data.cpf || "",
        rg: data.rg || "",
        birthDate: data.birthDate ? data.birthDate.slice(0, 10) : "",
        sex: data.sex || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        profession: data.profession || "",
        insurance: data.insurance || "",
        notes: data.notes || "",
        lgpdConsent: data.lgpdConsent || false,
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);

    const res = await fetch(`/api/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    });

    setSaving(false);

    if (res.ok) {
      toast.success("Paciente atualizado com sucesso!");
      router.push(`/patients/${id}`);
    } else {
      const err = await res.json();
      toast.error(err.error?.fieldErrors?.name?.[0] || "Erro ao atualizar paciente");
    }
  }

  if (loading) return <div className="text-gray-500">Carregando...</div>;
  if (!patient) return <div className="text-gray-500">Paciente não encontrado</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCog className="h-6 w-6 text-teal-400" />
          Editar Paciente
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                required
                value={patient.name}
                onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={patient.cpf || ""}
                onChange={(e) => setPatient({ ...patient, cpf: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={patient.rg || ""}
                onChange={(e) => setPatient({ ...patient, rg: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={patient.birthDate || ""}
                onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexo</Label>
              <Select
                value={patient.sex || ""}
                onValueChange={(v) => setPatient({ ...patient, sex: v })}
              >
                <SelectTrigger className="bg-[#16161f] border-[#2a2a3a]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="O">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={patient.phone || ""}
                onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={patient.email || ""}
                onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={patient.address || ""}
                onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Dados Clínicos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profession">Profissão</Label>
              <Input
                id="profession"
                value={patient.profession || ""}
                onChange={(e) => setPatient({ ...patient, profession: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Convênio</Label>
              <Input
                id="insurance"
                value={patient.insurance || ""}
                onChange={(e) => setPatient({ ...patient, insurance: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                rows={3}
                value={patient.notes || ""}
                onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Consentimento LGPD</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={patient.lgpdConsent}
                onChange={(e) => setPatient({ ...patient, lgpdConsent: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm text-gray-400">
                O paciente autoriza o tratamento de seus dados pessoais e de saúde
                conforme a Lei Geral de Proteção de Dados (Lei n 13.709/2018),
                para fins de atendimento medico homeopatico.
              </span>
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Link href={`/patients/${id}`}>
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
