"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, ChevronDown, ChevronRight } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  cpf: string;
  lgpdConsent: boolean;
}

interface Consent {
  id: string;
  patientId: string;
  consentType: string;
  granted: boolean;
  date: string;
}

const consentTypeLabels: Record<string, string> = {
  medical_treatment: "Tratamento Médico",
  data_storage: "Armazenamento de Dados",
  communications: "Comunicações",
};

export default function ConsentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Erro ao carregar pacientes");
      const data = await res.json();
      setPatients(data);
    } catch {
      toast.error("Erro ao carregar lista de pacientes.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchConsents(patientId: string) {
    setLoadingConsents(true);
    try {
      const res = await fetch(`/api/lgpd/consents?patientId=${patientId}`);
      if (!res.ok) throw new Error("Erro ao carregar consentimentos");
      const data = await res.json();
      setConsents(data);
    } catch {
      toast.error("Erro ao carregar consentimentos do paciente.");
      setConsents([]);
    } finally {
      setLoadingConsents(false);
    }
  }

  function togglePatient(patientId: string) {
    if (expandedPatientId === patientId) {
      setExpandedPatientId(null);
      setConsents([]);
    } else {
      setExpandedPatientId(patientId);
      fetchConsents(patientId);
    }
  }

  async function handleConsentAction(
    patientId: string,
    consentType: string,
    grant: boolean
  ) {
    try {
      const res = await fetch("/api/lgpd/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, consentType, granted: grant }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar consentimento");
      toast.success(
        grant
          ? "Consentimento concedido com sucesso."
          : "Consentimento revogado com sucesso."
      );
      fetchConsents(patientId);
    } catch {
      toast.error("Erro ao atualizar consentimento.");
    }
  }

  function getConsentForType(type: string): Consent | undefined {
    return consents.find((c) => c.consentType === type);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Consentimentos</h1>
        <p className="text-gray-400 mt-1">
          Gerencie os consentimentos LGPD de cada paciente
        </p>
      </div>

      <Card className="bg-[#111118] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-gray-200">Pacientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm">Carregando pacientes...</p>
          ) : patients.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum paciente encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-400" />
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">CPF</TableHead>
                  <TableHead className="text-gray-400">
                    Consentimento LGPD
                  </TableHead>
                  <TableHead className="text-gray-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <>
                    <TableRow
                      key={patient.id}
                      className="border-white/10 cursor-pointer hover:bg-[#16161f]"
                      onClick={() => togglePatient(patient.id)}
                    >
                      <TableCell className="w-8">
                        {expandedPatientId === patient.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {patient.name}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {patient.cpf}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={patient.lgpdConsent ? "default" : "destructive"}
                          className={
                            patient.lgpdConsent
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }
                        >
                          {patient.lgpdConsent ? "Concedido" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePatient(patient.id);
                          }}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedPatientId === patient.id && (
                      <TableRow
                        key={`${patient.id}-consents`}
                        className="border-white/10 hover:bg-transparent"
                      >
                        <TableCell colSpan={5} className="p-4">
                          {loadingConsents ? (
                            <p className="text-gray-400 text-sm">
                              Carregando consentimentos...
                            </p>
                          ) : (
                            <div className="bg-[#0a0a0f] rounded-lg p-4 space-y-3">
                              <p className="text-sm font-medium text-gray-300 mb-3">
                                Consentimentos Granulares
                              </p>
                              {Object.entries(consentTypeLabels).map(
                                ([type, label]) => {
                                  const consent = getConsentForType(type);
                                  return (
                                    <div
                                      key={type}
                                      className="flex items-center justify-between py-2 px-3 rounded-md bg-[#111118] border border-white/5"
                                    >
                                      <div>
                                        <p className="text-sm text-gray-200">
                                          {label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {consent
                                            ? `${consent.granted ? "Concedido" : "Revogado"} em ${new Date(consent.date).toLocaleDateString("pt-BR")}`
                                            : "Sem registro"}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          className={
                                            consent?.granted
                                              ? "bg-green-500/20 text-green-400"
                                              : "bg-red-500/20 text-red-400"
                                          }
                                        >
                                          {consent?.granted
                                            ? "Ativo"
                                            : "Inativo"}
                                        </Badge>
                                        {consent?.granted ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            onClick={() =>
                                              handleConsentAction(
                                                patient.id,
                                                type,
                                                false
                                              )
                                            }
                                          >
                                            Revogar
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300"
                                            onClick={() =>
                                              handleConsentAction(
                                                patient.id,
                                                type,
                                                true
                                              )
                                            }
                                          >
                                            Conceder
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
