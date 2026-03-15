"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  User,
  Stethoscope,
  Brain,
  Shield,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDate, formatCPF, calculateAge } from "@/lib/utils";
import { toast } from "sonner";

interface PatientData {
  id: string;
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
  lgpdConsentDate: string | null;
  anamnesis: AnamnesisData | null;
  consultations: ConsultationData[];
  _count: { consultations: number };
}

interface ConsultationData {
  id: string;
  date: string;
  complaint: string | null;
  anamnesis: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  prescription: string | null;
  evolution: string | null;
  repertorialSymptoms: string | null;
  user: { name: string };
}

interface AnamnesisData {
  mental: string | null;
  general: string | null;
  desires: string | null;
  sleep: string | null;
  perspiration: string | null;
  thermoregulation: string | null;
  gyneco: string | null;
  particular: string | null;
}

const anamnesisFields = [
  { key: "mental", label: "Sintomas Mentais", icon: "🧠" },
  { key: "general", label: "Sintomas Gerais", icon: "🏥" },
  { key: "desires", label: "Desejos e Aversões Alimentares", icon: "🍽️" },
  { key: "sleep", label: "Sono e Sonhos", icon: "🌙" },
  { key: "perspiration", label: "Transpiração", icon: "💧" },
  { key: "thermoregulation", label: "Termorregulação", icon: "🌡️" },
  { key: "gyneco", label: "Ginecológico", icon: "♀️" },
  { key: "particular", label: "Sintomas Particulares", icon: "📋" },
] as const;

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [anamnesis, setAnamnesis] = useState<Record<string, string>>({});
  const [savingAnamnesis, setSavingAnamnesis] = useState(false);

  const fetchPatient = useCallback(async () => {
    const res = await fetch(`/api/patients/${id}`);
    if (res.ok) {
      const data = await res.json();
      setPatient(data);
      if (data.anamnesis) {
        const a: Record<string, string> = {};
        for (const f of anamnesisFields) {
          a[f.key] = data.anamnesis[f.key] || "";
        }
        setAnamnesis(a);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  async function saveAnamnesis() {
    setSavingAnamnesis(true);
    const res = await fetch(`/api/patients/${id}/anamnesis`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(anamnesis),
    });
    setSavingAnamnesis(false);
    if (res.ok) {
      toast.success("Anamnese salva com sucesso!");
    } else {
      toast.error("Erro ao salvar anamnese");
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Paciente excluído com sucesso!");
      router.push("/patients");
    } else {
      toast.error("Erro ao excluir paciente");
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-gray-500">Carregando...</div>;
  if (!patient) return <div className="text-gray-500">Paciente não encontrado</div>;

  const sexLabels: Record<string, string> = { M: "Masculino", F: "Feminino", O: "Outro" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-teal-600/20 flex items-center justify-center">
              <User className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                {patient.birthDate && <span>{calculateAge(patient.birthDate)}</span>}
                {patient.sex && <span>{sexLabels[patient.sex] || patient.sex}</span>}
                {patient.insurance && <Badge variant="secondary">{patient.insurance}</Badge>}
                {patient.lgpdConsent && (
                  <span className="flex items-center gap-1 text-teal-400">
                    <Shield className="h-3 w-3" /> LGPD
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/patients/${id}/edit`}>
              <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5">
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
            <Link href={`/patients/${id}/consultations/new`}>
              <Button className="bg-teal-600 hover:bg-teal-700" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nova Consulta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="bg-[#111118] border border-[#1e1e2e]">
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="consultas">
            Consultas ({patient._count.consultations})
          </TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese Homeopática</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <InfoField label="CPF" value={patient.cpf ? formatCPF(patient.cpf) : "—"} />
              <InfoField label="RG" value={patient.rg || "—"} />
              <InfoField label="Data de Nascimento" value={patient.birthDate ? formatDate(patient.birthDate) : "—"} />
              <InfoField label="Sexo" value={patient.sex ? sexLabels[patient.sex] || patient.sex : "—"} />
              <InfoField label="Telefone" value={patient.phone || "—"} />
              <InfoField label="Email" value={patient.email || "—"} />
              <InfoField label="Endereço" value={patient.address || "—"} className="md:col-span-2" />
              <InfoField label="Profissão" value={patient.profession || "—"} />
              <InfoField label="Convênio" value={patient.insurance || "—"} />
              {patient.notes && (
                <InfoField label="Observações" value={patient.notes} className="md:col-span-2" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultas">
          <div className="space-y-4">
            {patient.consultations.length === 0 ? (
              <Card className="bg-[#111118] border-[#1e1e2e]">
                <CardContent className="text-center py-8 text-gray-500">
                  Nenhuma consulta registrada
                </CardContent>
              </Card>
            ) : (
              patient.consultations.map((c) => (
                <Card key={c.id} className="bg-[#111118] border-[#1e1e2e]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-400" />
                        {formatDate(c.date)}
                      </CardTitle>
                      <span className="text-xs text-gray-500">Dr(a). {c.user.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {c.complaint && (
                      <ConsultSection label="Queixa Principal" value={c.complaint} color="text-amber-400" />
                    )}
                    {c.anamnesis && (
                      <ConsultSection label="Anamnese" value={c.anamnesis} color="text-cyan-400" />
                    )}
                    {c.physicalExam && (
                      <ConsultSection label="Exame Físico" value={c.physicalExam} color="text-green-400" />
                    )}
                    {c.diagnosis && (
                      <ConsultSection label="Diagnóstico" value={c.diagnosis} color="text-indigo-400" />
                    )}
                    {c.prescription && (
                      <div className="border-l-2 border-teal-500 pl-4">
                        <p className="text-xs font-semibold text-teal-400 mb-1">Prescrição (Rx)</p>
                        <p className="text-sm whitespace-pre-wrap">{c.prescription}</p>
                      </div>
                    )}
                    {c.evolution && (
                      <ConsultSection label="Evolução / Plano" value={c.evolution} color="text-purple-400" />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="anamnese">
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-teal-400" />
                Anamnese Homeopática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {anamnesisFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>{field.icon}</span>
                    {field.label}
                  </Label>
                  <Textarea
                    value={anamnesis[field.key] || ""}
                    onChange={(e) =>
                      setAnamnesis((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={3}
                    className="bg-[#16161f] border-[#2a2a3a]"
                  />
                </div>
              ))}
              <Button
                onClick={saveAnamnesis}
                disabled={savingAnamnesis}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {savingAnamnesis ? "Salvando..." : "Salvar Anamnese"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function ConsultSection({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold ${color} mb-1`}>{label}</p>
      <p className="text-sm text-gray-300 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
