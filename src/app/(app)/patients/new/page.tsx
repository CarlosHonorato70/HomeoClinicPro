"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      cpf: form.get("cpf") as string,
      rg: form.get("rg") as string,
      birthDate: form.get("birthDate") as string,
      sex: form.get("sex") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string,
      address: form.get("address") as string,
      profession: form.get("profession") as string,
      insurance: form.get("insurance") as string,
      notes: form.get("notes") as string,
      lgpdConsent: form.get("lgpdConsent") === "on",
    };

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      const patient = await res.json();
      toast.success("Paciente cadastrado com sucesso!");
      router.push(`/patients/${patient.id}`);
    } else {
      const err = await res.json();
      toast.error(err.error?.fieldErrors?.name?.[0] || "Erro ao cadastrar paciente");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-teal-400" />
          Novo Paciente
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
              <Input name="name" id="name" required className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input name="cpf" id="cpf" placeholder="000.000.000-00" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input name="rg" id="rg" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input name="birthDate" id="birthDate" type="date" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexo</Label>
              <Select name="sex">
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
              <Input name="phone" id="phone" placeholder="(11) 99999-9999" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" id="email" type="email" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input name="address" id="address" className="bg-[#16161f] border-[#2a2a3a]" />
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
              <Input name="profession" id="profession" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Convênio</Label>
              <Input name="insurance" id="insurance" className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea name="notes" id="notes" rows={3} className="bg-[#16161f] border-[#2a2a3a]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Consentimento LGPD</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="lgpdConsent" className="mt-1" />
              <span className="text-sm text-gray-400">
                O paciente autoriza o tratamento de seus dados pessoais e de saúde
                conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
                para fins de atendimento médico homeopático.
              </span>
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Cadastrar Paciente"}
          </Button>
          <Link href="/patients">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
