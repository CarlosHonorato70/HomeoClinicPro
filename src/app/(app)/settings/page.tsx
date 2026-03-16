"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Shield } from "lucide-react";

interface SettingsData {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  crm: string;
  dpoName: string;
  dpoEmail: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    crm: "",
    dpoName: "",
    dpoEmail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/dpo");
      if (!res.ok) throw new Error("Erro ao carregar configurações");
      const data = await res.json();
      const sanitized = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v ?? ""])
      );
      setSettings((prev) => ({ ...prev, ...sanitized }));
    } catch {
      toast.error("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/dpo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Erro ao salvar configurações");
      toast.success("Configurações salvas com sucesso.");
    } catch {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof SettingsData, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  const inputClassName = "bg-[#111118] border-white/10 text-gray-200";

  if (loading) {
    return (
      <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-400">Carregando...</p>
      </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-400 mt-1">
          Gerencie os dados da clínica e do encarregado de dados
        </p>
      </div>

      <Card className="bg-[#111118] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-gray-200">Dados da Clínica</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome da Clínica</Label>
              <Input
                value={settings.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nome da clínica"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">CNPJ</Label>
              <Input
                value={settings.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Telefone</Label>
              <Input
                value={settings.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(00) 00000-0000"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contato@clinica.com"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-300">Endereço</Label>
              <Input
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Endereço completo"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">CRM</Label>
              <Input
                value={settings.crm}
                onChange={(e) => handleChange("crm", e.target.value)}
                placeholder="CRM/UF 000000"
                className={inputClassName}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111118] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-gray-200">
              Encarregado de Dados (DPO)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            Conforme Art. 41 da LGPD, o controlador deverá indicar encarregado
            pelo tratamento de dados pessoais.
          </p>
          <Separator className="bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome do DPO</Label>
              <Input
                value={settings.dpoName}
                onChange={(e) => handleChange("dpoName", e.target.value)}
                placeholder="Nome completo do encarregado"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email do DPO</Label>
              <Input
                type="email"
                value={settings.dpoEmail}
                onChange={(e) => handleChange("dpoEmail", e.target.value)}
                placeholder="dpo@clinica.com"
                className={inputClassName}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
    </AdminGuard>
  );
}
