"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AudioRecorderProps {
  /** Called when transcription completes — receives the full text */
  onTranscription: (text: string) => void;
  /** Optional: called with extracted symptoms from the transcription */
  onSymptomsExtracted?: (symptoms: string[]) => void;
  /** Disable the component */
  disabled?: boolean;
}

type RecorderState = "idle" | "recording" | "processing";

export function AudioRecorder({
  onTranscription,
  onSymptomsExtracted,
  disabled = false,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prefer webm/opus, fallback to whatever is available
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const blob = new Blob(chunks.current, { type: mimeType });
        if (blob.size < 1000) {
          toast.error("Gravação muito curta. Tente novamente.");
          setState("idle");
          setElapsed(0);
          return;
        }

        setState("processing");
        await transcribe(blob);
      };

      recorder.start(1000); // 1s timeslices
      mediaRecorder.current = recorder;
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      toast.error("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
  }, []);

  async function transcribe(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro na transcrição");
      }

      const data = await res.json();

      if (data.text) {
        onTranscription(data.text);
        toast.success(
          `Transcrição concluída${data.duration ? ` (${Math.round(data.duration)}s de áudio)` : ""}`
        );
      } else {
        toast.error("Nenhum texto detectado na gravação.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao transcrever áudio");
    } finally {
      setState("idle");
      setElapsed(0);
    }
  }

  async function extractSymptoms() {
    if (!onSymptomsExtracted) return;

    try {
      const anamnesisField = document.querySelector<HTMLTextAreaElement>(
        'textarea[name="anamnesis"]'
      );
      const text = anamnesisField?.value;
      if (!text || text.length < 10) {
        toast.error("Preencha a anamnese antes de extrair sintomas.");
        return;
      }

      toast.loading("Extraindo sintomas...", { id: "extract" });

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: text }),
      });

      toast.dismiss("extract");

      if (res.ok) {
        const data = await res.json();
        const symptoms = data.groups?.flatMap(
          (g: { rubrics: { symptomPt: string }[] }) =>
            g.rubrics.map((r: { symptomPt: string }) => r.symptomPt)
        ) || [];
        if (symptoms.length > 0) {
          onSymptomsExtracted(symptoms);
          toast.success(`${symptoms.length} sintomas extraídos`);
        } else {
          toast.info("Nenhum sintoma identificado. Tente descrever com mais detalhes.");
        }
      }
    } catch {
      toast.error("Erro ao extrair sintomas.");
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {state === "idle" && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            disabled={disabled}
            className="gap-2 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
          >
            <Mic className="h-4 w-4" />
            Gravar Consulta
          </Button>
          {onSymptomsExtracted && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={extractSymptoms}
              disabled={disabled}
              className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
            >
              <Sparkles className="h-4 w-4" />
              Extrair Sintomas
            </Button>
          )}
        </>
      )}

      {state === "recording" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-mono text-red-400">
              {formatTime(elapsed)}
            </span>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square className="h-3 w-3" />
            Parar
          </Button>
        </div>
      )}

      {state === "processing" && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
          Transcrevendo áudio...
        </div>
      )}
    </div>
  );
}
