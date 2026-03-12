"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

interface ClinicData {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  crm: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ClinicData>({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    crm: "",
  });

  function handleChange(field: keyof ClinicData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!data.name.trim()) {
      toast.error("O nome da clínica é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings/dpo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar dados da clínica");
      }

      toast.success("Dados da clínica salvos com sucesso!");
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const inputClassName = "bg-[#111118] border-white/10 text-gray-200";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-teal-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">
            Bem-vindo ao HomeoClinic Pro!
          </h1>
          <p className="text-gray-400 text-lg">
            Configure os dados da sua cl&iacute;nica para come&ccedil;ar.
          </p>
        </div>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-gray-200">Dados da Cl&iacute;nica</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-300">
                    Nome da Cl&iacute;nica <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={data.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nome da clínica"
                    required
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">CNPJ</Label>
                  <Input
                    value={data.cnpj}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Telefone</Label>
                  <Input
                    value={data.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contato@clinica.com"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">CRM</Label>
                  <Input
                    value={data.crm}
                    onChange={(e) => handleChange("crm", e.target.value)}
                    placeholder="CRM/UF 000000"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-300">Endere&ccedil;o</Label>
                  <Input
                    value={data.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Endereço completo"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </span>
                  ) : (
                    "Salvar e Continuar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
