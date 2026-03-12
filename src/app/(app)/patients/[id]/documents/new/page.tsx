"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, FileText, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const typeLabels: Record<string, string> = {
  tcle: "TCLE — Termo de Consentimento Livre e Esclarecido",
  prescription: "Receituário",
  certificate: "Atestado Médico",
  report: "Relatório Clínico",
};

const defaultTitles: Record<string, string> = {
  tcle: "Termo de Consentimento Livre e Esclarecido",
  prescription: "Receituário Homeopático",
  certificate: "Atestado Médico",
  report: "Relatório Clínico",
};

export default function NewDocumentPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [docType, setDocType] = useState("tcle");
  const [title, setTitle] = useState(defaultTitles.tcle);

  // TCLE fields
  const [procedureDescription, setProcedureDescription] = useState("");
  const [risks, setRisks] = useState("");
  const [benefits, setBenefits] = useState("");
  const [alternatives, setAlternatives] = useState("");

  // Prescription fields
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medication: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  // Certificate fields
  const [days, setDays] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cid, setCid] = useState("");
  const [certificateNotes, setCertificateNotes] = useState("");

  // Report fields
  const [period, setPeriod] = useState("");
  const [reportContent, setReportContent] = useState("");

  useEffect(() => {
    fetch(`/api/patients/${patientId}`)
      .then((r) => r.json())
      .then((d) => setPatientName(d.name || ""));
  }, [patientId]);

  function handleTypeChange(type: string) {
    setDocType(type);
    setTitle(defaultTitles[type] || "");
  }

  function addPrescriptionItem() {
    setPrescriptionItems((prev) => [
      ...prev,
      { medication: "", dosage: "", frequency: "", duration: "" },
    ]);
  }

  function removePrescriptionItem(index: number) {
    setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePrescriptionItem(
    index: number,
    field: keyof PrescriptionItem,
    value: string
  ) {
    setPrescriptionItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function buildContent(): string {
    switch (docType) {
      case "tcle":
        return JSON.stringify({
          procedureDescription,
          risks,
          benefits,
          alternatives,
        });
      case "prescription":
        return JSON.stringify({
          items: prescriptionItems,
          notes: prescriptionNotes,
        });
      case "certificate":
        return JSON.stringify({
          days: Number(days),
          startDate,
          cid,
          notes: certificateNotes,
        });
      case "report":
        return JSON.stringify({
          period,
          content: reportContent,
        });
      default:
        return "{}";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const content = buildContent();

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        type: docType,
        title,
        content,
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Documento criado com sucesso!");
      router.push(`/patients/${patientId}/documents`);
    } else {
      const err = await res.json();
      toast.error(
        err.error?.fieldErrors?.title?.[0] || "Erro ao criar documento"
      );
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}/documents`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-teal-400" />
          Novo Documento
        </h1>
        {patientName && (
          <span className="text-gray-400">— {patientName}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={docType} onValueChange={(v) => v && handleTypeChange(v)}>
                <SelectTrigger className="bg-[#16161f] border-[#2a2a3a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
          </CardContent>
        </Card>

        {docType === "tcle" && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="text-lg">
                Termo de Consentimento Livre e Esclarecido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="procedureDescription">
                  Descrição do Procedimento
                </Label>
                <Textarea
                  id="procedureDescription"
                  value={procedureDescription}
                  onChange={(e) => setProcedureDescription(e.target.value)}
                  rows={4}
                  placeholder="Descreva o procedimento a ser realizado..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risks">Riscos</Label>
                <Textarea
                  id="risks"
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  rows={3}
                  placeholder="Descreva os riscos envolvidos..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits">Benefícios</Label>
                <Textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  rows={3}
                  placeholder="Descreva os benefícios esperados..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatives">Alternativas</Label>
                <Textarea
                  id="alternatives"
                  value={alternatives}
                  onChange={(e) => setAlternatives(e.target.value)}
                  rows={3}
                  placeholder="Descreva as alternativas ao procedimento..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {docType === "prescription" && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="text-lg">Receituário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescriptionItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-[#2a2a3a] rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-teal-400">
                      Medicamento {index + 1}
                    </span>
                    {prescriptionItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrescriptionItem(index)}
                        className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Medicamento</Label>
                      <Input
                        value={item.medication}
                        onChange={(e) =>
                          updatePrescriptionItem(
                            index,
                            "medication",
                            e.target.value
                          )
                        }
                        placeholder="Ex: Nux Vomica 30CH"
                        className="bg-[#16161f] border-[#2a2a3a]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dosagem</Label>
                      <Input
                        value={item.dosage}
                        onChange={(e) =>
                          updatePrescriptionItem(
                            index,
                            "dosage",
                            e.target.value
                          )
                        }
                        placeholder="Ex: 3 glóbulos"
                        className="bg-[#16161f] border-[#2a2a3a]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Frequência</Label>
                      <Input
                        value={item.frequency}
                        onChange={(e) =>
                          updatePrescriptionItem(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        placeholder="Ex: 3x ao dia"
                        className="bg-[#16161f] border-[#2a2a3a]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duração</Label>
                      <Input
                        value={item.duration}
                        onChange={(e) =>
                          updatePrescriptionItem(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        placeholder="Ex: 30 dias"
                        className="bg-[#16161f] border-[#2a2a3a]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addPrescriptionItem}
                className="border-[#2a2a3a]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar medicamento
              </Button>
              <div className="space-y-2">
                <Label htmlFor="prescriptionNotes">Observações</Label>
                <Textarea
                  id="prescriptionNotes"
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  rows={3}
                  placeholder="Orientações adicionais..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {docType === "certificate" && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="text-lg">Atestado Médico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="days">Dias de Afastamento</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Ex: 3"
                    className="bg-[#16161f] border-[#2a2a3a]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#16161f] border-[#2a2a3a]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cid">CID</Label>
                  <Input
                    id="cid"
                    value={cid}
                    onChange={(e) => setCid(e.target.value)}
                    placeholder="Ex: J06.9"
                    className="bg-[#16161f] border-[#2a2a3a]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateNotes">Observações</Label>
                <Textarea
                  id="certificateNotes"
                  value={certificateNotes}
                  onChange={(e) => setCertificateNotes(e.target.value)}
                  rows={3}
                  placeholder="Informações adicionais..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {docType === "report" && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="text-lg">Relatório Clínico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Input
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ex: Janeiro/2026 a Março/2026"
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportContent">Conteúdo do Relatório</Label>
                <Textarea
                  id="reportContent"
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  rows={10}
                  placeholder="Descreva o relatório clínico do paciente..."
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Criar Documento"}
          </Button>
          <Link href={`/patients/${patientId}/documents`}>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
