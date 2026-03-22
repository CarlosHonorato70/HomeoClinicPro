"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeOff, Search, AlertTriangle, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  lgpdConsent: boolean;
}

export default function AnonymizePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [anonymizing, setAnonymizing] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.filter((p: Patient) => p.name !== "ANONIMIZADO"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnonymize = async (patientId: string) => {
    setAnonymizing(patientId);
    try {
      const res = await fetch(`/api/lgpd/anonymize/${patientId}`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Dados anonimizados com sucesso. Dados clinicos mantidos (CFM 20 anos).");
        setPatients((prev) => prev.filter((p) => p.id !== patientId));
        setConfirmId(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao anonimizar");
      }
    } catch {
      toast.error("Erro ao anonimizar dados");
    } finally {
      setAnonymizing(null);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/lgpd">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <EyeOff className="h-6 w-6 text-teal-400" />
              Anonimizacao de Dados
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Anonimize dados pessoais mantendo registros clinicos (Art. 18 LGPD + CFM 20 anos)
            </p>
          </div>
        </div>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-amber-200 font-medium">
                Acao irreversivel
              </p>
              <p className="text-sm text-amber-300/70">
                A anonimizacao substitui permanentemente nome, CPF, RG, telefone, email,
                endereco, profissao, convenio e observacoes por dados anonimos.
                Os dados clinicos (consultas, anamnese, prescricoes) sao mantidos
                conforme exigencia de retencao de 20 anos do CFM.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar paciente por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#111118] border-white/10 text-gray-200"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Carregando pacientes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Nenhum paciente encontrado
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((patient) => (
              <Card key={patient.id} className="bg-[#111118] border-[#1e1e2e]">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-200 font-medium">{patient.name}</p>
                      <p className="text-xs text-gray-500">
                        {patient.cpf || "Sem CPF"} | {patient.email || "Sem email"} | {patient.phone || "Sem telefone"}
                      </p>
                    </div>
                  </div>

                  {confirmId === patient.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400">Confirmar?</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={anonymizing === patient.id}
                        onClick={() => handleAnonymize(patient.id)}
                      >
                        {anonymizing === patient.id ? "Anonimizando..." : "Sim, anonimizar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                      onClick={() => setConfirmId(patient.id)}
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Anonimizar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
