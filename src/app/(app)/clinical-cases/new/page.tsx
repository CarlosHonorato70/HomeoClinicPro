"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookMarked, ArrowLeft, Star, Save } from "lucide-react";
import Link from "next/link";

export default function NewClinicalCasePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [prescribedRemedy, setPrescribedRemedy] = useState("");
  const [potency, setPotency] = useState("");
  const [outcome, setOutcome] = useState("");
  const [outcomeRating, setOutcomeRating] = useState(0);
  const [tags, setTags] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState("");

  async function handleSave() {
    if (!title || !summary || !symptoms) {
      setError("Preencha titulo, resumo e sintomas.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/clinical-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          symptoms,
          prescribedRemedy: prescribedRemedy || undefined,
          potency: potency || undefined,
          outcome: outcome || undefined,
          outcomeRating: outcomeRating || undefined,
          tags: tags || undefined,
          patientAge: patientAge ? Number(patientAge) : undefined,
          patientSex: patientSex || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.fieldErrors ? "Corrija os campos." : "Erro ao salvar.");
        return;
      }

      const data = await res.json();
      router.push(`/clinical-cases/${data.id}`);
    } catch {
      setError("Erro de conexao.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/clinical-cases">
          <Button variant="ghost" size="sm" className="text-gray-400">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-teal-400" />
          Novo Caso Clinico
        </h1>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-base">Dados do Caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-400">Titulo *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Caso de ansiedade com insonia cronica"
              className="bg-[#0a0a0f] border-[#1e1e2e]"
            />
          </div>

          <div>
            <Label className="text-gray-400">Resumo do Caso *</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Descricao geral do caso, contexto do paciente, queixa principal..."
              className="bg-[#0a0a0f] border-[#1e1e2e] min-h-[120px]"
            />
          </div>

          <div>
            <Label className="text-gray-400">Sintomas Principais *</Label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Liste os sintomas repertoriais mais importantes do caso..."
              className="bg-[#0a0a0f] border-[#1e1e2e] min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Remedio Prescrito</Label>
              <Input
                value={prescribedRemedy}
                onChange={(e) => setPrescribedRemedy(e.target.value)}
                placeholder="Ex: Arsenicum album"
                className="bg-[#0a0a0f] border-[#1e1e2e]"
              />
            </div>
            <div>
              <Label className="text-gray-400">Potencia</Label>
              <Input
                value={potency}
                onChange={(e) => setPotency(e.target.value)}
                placeholder="Ex: 30CH, 200CH, 1M"
                className="bg-[#0a0a0f] border-[#1e1e2e]"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Evolucao / Outcome</Label>
            <Textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Descreva a evolucao do paciente apos o tratamento..."
              className="bg-[#0a0a0f] border-[#1e1e2e] min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-gray-400">Avaliacao do Resultado</Label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOutcomeRating(i === outcomeRating ? 0 : i)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i <= outcomeRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              ))}
              {outcomeRating > 0 && (
                <span className="text-sm text-gray-400 ml-2">
                  {outcomeRating === 1 && "Sem melhora"}
                  {outcomeRating === 2 && "Melhora leve"}
                  {outcomeRating === 3 && "Melhora moderada"}
                  {outcomeRating === 4 && "Melhora significativa"}
                  {outcomeRating === 5 && "Cura completa"}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Idade do Paciente</Label>
              <Input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Ex: 35"
                className="bg-[#0a0a0f] border-[#1e1e2e]"
              />
            </div>
            <div>
              <Label className="text-gray-400">Sexo do Paciente</Label>
              <Select value={patientSex} onValueChange={(v) => setPatientSex(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Tags (separadas por virgula)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: ansiedade, insonia, digestivo"
              className="bg-[#0a0a0f] border-[#1e1e2e]"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Link href="/clinical-cases">
              <Button variant="ghost" className="text-gray-400">Cancelar</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Caso"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
