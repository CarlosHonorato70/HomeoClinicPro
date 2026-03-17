"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Video,
  VideoOff,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Stethoscope,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { AudioRecorder } from "@/components/audio-recorder";
import { Badge } from "@/components/ui/badge";

interface AppointmentData {
  id: string;
  date: string;
  time: string;
  type: string;
  meetingUrl: string | null;
  meetingRoomId: string | null;
  status: string;
  notes: string | null;
  patient: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
}

interface PatientDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  sex: string | null;
  birthDate: string | null;
  consultations: {
    id: string;
    date: string;
    complaint: string;
    prescription: string | null;
  }[];
  anamnesis: {
    mental: string | null;
    general: string | null;
    particular: string | null;
  } | null;
}

export default function TelemedicinePage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [showVideo, setShowVideo] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save notes with 2s debounce
  const autoSaveNotes = useCallback(async (text: string) => {
    if (!appointmentId) return;
    setSaveStatus("saving");
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: text }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [appointmentId]);

  function handleNotesChange(value: string) {
    setNotes(value);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSaveNotes(value), 2000);
  }

  function handleTranscription(text: string) {
    const updated = notes ? `${notes}\n\n--- Transcrição ---\n${text}` : text;
    setNotes(updated);
    autoSaveNotes(updated);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          router.push("/agenda");
          return;
        }
        const data = await res.json();
        setAppointment(data);
        setNotes(data.notes || "");

        if (data.patient?.id) {
          const pRes = await fetch(`/api/patients/${data.patient.id}`);
          if (pRes.ok) {
            setPatient(await pRes.json());
          }
        }
      } catch {
        router.push("/agenda");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appointmentId, router]);

  async function handleEndSession() {
    if (appointment?.patient?.id) {
      router.push(
        `/patients/${appointment.patient.id}/consultations/new?from=telemedicina`
      );
    } else {
      router.push("/agenda");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-3">
          <Video className="h-12 w-12 text-teal-400 mx-auto animate-pulse" />
          <p className="text-gray-400">Carregando teleconsulta...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !appointment.meetingUrl) {
    return (
      <div className="text-center py-20">
        <VideoOff className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Este agendamento nao possui teleconsulta.</p>
        <Link href="/agenda" className="text-teal-400 hover:underline text-sm mt-2 block">
          Voltar para Agenda
        </Link>
      </div>
    );
  }

  const jitsiUrl = `${appointment.meetingUrl}#config.prejoinPageEnabled=true&config.lang=pt&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/agenda">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4 mr-1" /> Agenda
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-indigo-400" />
            <h1 className="text-lg font-bold">Teleconsulta</h1>
          </div>
          {appointment.patient && (
            <span className="text-gray-400">
              — {appointment.patient.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVideo(!showVideo)}
            className="border-[#1e1e2e] text-gray-400"
          >
            {showVideo ? <VideoOff className="h-4 w-4 mr-1" /> : <Video className="h-4 w-4 mr-1" />}
            {showVideo ? "Ocultar Video" : "Mostrar Video"}
          </Button>
          <a
            href={appointment.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" /> Abrir em nova aba
          </a>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {/* Video Area */}
        <div className="space-y-4">
          {showVideo ? (
            <div className="rounded-xl overflow-hidden border border-[#1e1e2e] bg-black" style={{ height: "65vh" }}>
              <iframe
                src={jitsiUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          ) : (
            <Card className="bg-[#111118] border-[#1e1e2e] flex items-center justify-center" style={{ height: "65vh" }}>
              <div className="text-center space-y-3">
                <VideoOff className="h-16 w-16 text-gray-600 mx-auto" />
                <p className="text-gray-500">Video oculto</p>
                <Button onClick={() => setShowVideo(true)} variant="outline" className="border-[#1e1e2e]">
                  Mostrar Video
                </Button>
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-400" />
                  Notas da Teleconsulta
                </span>
                {saveStatus === "saving" && (
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    Salvando...
                  </Badge>
                )}
                {saveStatus === "saved" && (
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    Salvo
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Anote observacoes durante a consulta..."
                className="bg-[#0a0a0f] border-[#1e1e2e] min-h-[100px]"
              />
              <AudioRecorder
                onTranscription={handleTranscription}
              />
            </CardContent>
          </Card>
        </div>

        {/* Patient Sidebar */}
        <div className="space-y-4">
          {/* Patient Info */}
          {patient && (
            <Card className="bg-[#111118] border-[#1e1e2e]">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-400" />
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm">
                <p className="font-medium text-gray-200">{patient.name}</p>
                {patient.sex && <p className="text-gray-400">Sexo: {patient.sex === "M" ? "Masculino" : "Feminino"}</p>}
                {patient.birthDate && (
                  <p className="text-gray-400">
                    Nascimento: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {patient.phone && <p className="text-gray-400">Tel: {patient.phone}</p>}
                {patient.email && <p className="text-gray-400">Email: {patient.email}</p>}
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-teal-400 hover:underline text-xs block mt-2"
                >
                  Ver ficha completa
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Anamnesis Summary */}
          {patient?.anamnesis && (
            <Card className="bg-[#111118] border-[#1e1e2e]">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-amber-400" />
                  Anamnese (Resumo)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-xs">
                {patient.anamnesis.mental && (
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">Mental</p>
                    <p className="text-gray-300 line-clamp-3">{patient.anamnesis.mental}</p>
                  </div>
                )}
                {patient.anamnesis.general && (
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">Geral</p>
                    <p className="text-gray-300 line-clamp-3">{patient.anamnesis.general}</p>
                  </div>
                )}
                {patient.anamnesis.particular && (
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">Particular</p>
                    <p className="text-gray-300 line-clamp-3">{patient.anamnesis.particular}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Consultations */}
          {patient?.consultations && patient.consultations.length > 0 && (
            <Card className="bg-[#111118] border-[#1e1e2e]">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  Consultas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {patient.consultations.slice(0, 5).map((c) => (
                  <div key={c.id} className="text-xs border-b border-[#1e1e2e] pb-2 last:border-0">
                    <p className="text-gray-500">
                      {new Date(c.date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-gray-300 line-clamp-2">{c.complaint}</p>
                    {c.prescription && (
                      <p className="text-teal-400 mt-1">Rx: {c.prescription.slice(0, 80)}...</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleEndSession}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Encerrar e Criar Consulta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
