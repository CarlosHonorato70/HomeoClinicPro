"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, FileText, User } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  cpf: string;
}

interface ExportPreview {
  name: string;
  email: string;
  consultationCount: number;
}

export default function ExportPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPreview(selectedPatientId);
    } else {
      setPreview(null);
    }
  }, [selectedPatientId]);

  async function fetchPatients() {
    try {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Erro ao carregar pacientes");
      const data = await res.json();
      setPatients(data);
    } catch {
      toast.error("Erro ao carregar lista de pacientes.");
    } finally {
      setLoadingPatients(false);
    }
  }

  async function fetchPreview(patientId: string) {
    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/lgpd/export/${patientId}?preview=true`);
      if (!res.ok) throw new Error("Erro ao carregar preview");
      const data = await res.json();
      setPreview(data);
    } catch {
      toast.error("Erro ao carregar preview dos dados.");
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleExport() {
    if (!selectedPatientId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/lgpd/export/${selectedPatientId}`);
      if (!res.ok) throw new Error("Erro ao exportar dados");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dados_paciente_${selectedPatientId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso.");
    } catch {
      toast.error("Erro ao exportar dados do paciente.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exportação de Dados (Art. 18 LGPD)</h1>
        <p className="text-gray-400 mt-1">
          Exporte os dados de um paciente em formato JSON para portabilidade
        </p>
      </div>

      <Card className="bg-[#111118] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-gray-200">Selecionar Paciente</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Paciente</Label>
            {loadingPatients ? (
              <p className="text-gray-400 text-sm">Carregando pacientes...</p>
            ) : (
              <Select
                value={selectedPatientId}
                onValueChange={(v) => setSelectedPatientId(v ?? "")}
              >
                <SelectTrigger className="bg-[#111118] border-white/10 text-gray-200">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-white/10">
                  {patients.map((patient) => (
                    <SelectItem
                      key={patient.id}
                      value={patient.id}
                      className="text-gray-200 focus:bg-teal-500/10 focus:text-teal-400"
                    >
                      {patient.name} - {patient.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {loadingPreview && (
            <p className="text-gray-400 text-sm">Carregando preview...</p>
          )}

          {preview && !loadingPreview && (
            <>
              <Separator className="bg-white/10" />
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-300">
                  Preview dos dados a exportar
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-white/5">
                    <User className="h-4 w-4 text-teal-400" />
                    <div>
                      <p className="text-xs text-gray-500">Nome</p>
                      <p className="text-sm text-gray-200">{preview.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-white/5">
                    <FileText className="h-4 w-4 text-teal-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-200">
                        {preview.email || "Não informado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] border border-white/5">
                    <FileText className="h-4 w-4 text-teal-400" />
                    <div>
                      <p className="text-xs text-gray-500">Consultas</p>
                      <p className="text-sm text-gray-200">
                        {preview.consultationCount}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? "Exportando..." : "Exportar JSON"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
