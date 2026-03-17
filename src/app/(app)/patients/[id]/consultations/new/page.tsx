"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { AudioRecorder } from "@/components/audio-recorder";

export default function NewConsultationPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState("");
  const anamnesisRef = useRef<HTMLTextAreaElement>(null);
  const symptomsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/patients/${patientId}`)
      .then((r) => r.json())
      .then((d) => setPatientName(d.name || ""));
  }, [patientId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      patientId,
      date: form.get("date") as string,
      complaint: form.get("complaint") as string,
      anamnesis: form.get("anamnesis") as string,
      physicalExam: form.get("physicalExam") as string,
      diagnosis: form.get("diagnosis") as string,
      repertorialSymptoms: form.get("repertorialSymptoms") as string,
      prescription: form.get("prescription") as string,
      evolution: form.get("evolution") as string,
    };

    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Consulta registrada com sucesso!");
      router.push(`/patients/${patientId}`);
    } else {
      const err = await res.json();
      toast.error(err.error?.fieldErrors?.complaint?.[0] || "Erro ao registrar consulta");
    }
  }

  function handleTranscription(text: string) {
    if (anamnesisRef.current) {
      const current = anamnesisRef.current.value;
      anamnesisRef.current.value = current
        ? `${current}\n\n--- Transcrição ---\n${text}`
        : text;
      // Trigger React's change detection
      const event = new Event("input", { bubbles: true });
      anamnesisRef.current.dispatchEvent(event);
    }
  }

  function handleSymptomsExtracted(symptoms: string[]) {
    if (symptomsRef.current) {
      const current = symptomsRef.current.value;
      const symptomsText = symptoms.join("\n");
      symptomsRef.current.value = current
        ? `${current}\n${symptomsText}`
        : symptomsText;
      const event = new Event("input", { bubbles: true });
      symptomsRef.current.dispatchEvent(event);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-teal-400" />
          Nova Consulta
        </h1>
        {patientName && (
          <span className="text-gray-400">— {patientName}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Dados da Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                name="date"
                id="date"
                type="date"
                defaultValue={today}
                required
                className="bg-[#16161f] border-[#2a2a3a] w-48"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complaint">Queixa Principal *</Label>
              <Textarea
                name="complaint"
                id="complaint"
                required
                rows={3}
                placeholder="Descreva a queixa principal do paciente..."
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Anamnese & Exame</CardTitle>
              <AudioRecorder
                onTranscription={handleTranscription}
                onSymptomsExtracted={handleSymptomsExtracted}
                disabled={loading}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anamnesis">Anamnese Homeopática</Label>
              <Textarea
                ref={anamnesisRef}
                name="anamnesis"
                id="anamnesis"
                rows={6}
                placeholder="Sintomas mentais, gerais, particulares... ou use o botão 🎙️ Gravar para transcrever"
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalExam">Exame Físico</Label>
              <Textarea
                name="physicalExam"
                id="physicalExam"
                rows={3}
                placeholder="Achados do exame físico..."
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Textarea
                name="diagnosis"
                id="diagnosis"
                rows={2}
                placeholder="Diagnóstico clínico e homeopático..."
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-lg">Repertorização & Prescrição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repertorialSymptoms">Sintomas Repertoriais</Label>
              <Textarea
                ref={symptomsRef}
                name="repertorialSymptoms"
                id="repertorialSymptoms"
                rows={3}
                placeholder="Rubricas selecionadas para repertorização..."
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription">Prescrição (Rx)</Label>
              <Textarea
                name="prescription"
                id="prescription"
                rows={4}
                placeholder="Medicamento, potência, posologia..."
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evolution">Evolução / Plano</Label>
              <Textarea
                name="evolution"
                id="evolution"
                rows={3}
                placeholder="Acompanhamento e plano terapêutico..."
                className="bg-[#16161f] border-[#2a2a3a]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Registrar Consulta"}
          </Button>
          <Link href={`/patients/${patientId}`}>
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
