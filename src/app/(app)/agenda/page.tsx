"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";

interface Patient {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patientId: string | null;
  patient: { id: string; name: string; phone: string | null } | null;
  date: string;
  time: string;
  duration: number;
  type: string;
  notes: string | null;
  status: string;
}

const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const TYPE_LABELS: Record<string, string> = {
  consultation: "Consulta",
  "follow-up": "Retorno",
  "first-visit": "Primeira Consulta",
};

function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formPatientId, setFormPatientId] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formDuration, setFormDuration] = useState("30");
  const [formType, setFormType] = useState("consultation");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("scheduled");

  const dateISO = formatDateISO(selectedDate);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/appointments?date=${dateISO}`);
    if (res.ok) {
      setAppointments(await res.json());
    }
    setLoading(false);
  }, [dateISO]);

  const fetchPatients = useCallback(async () => {
    const res = await fetch("/api/patients");
    if (res.ok) {
      setPatients(await res.json());
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  function navigateDay(offset: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    setSelectedDate(next);
  }

  function openNewDialog(time: string) {
    setEditingAppointment(null);
    setFormPatientId("");
    setFormTime(time);
    setFormDuration("30");
    setFormType("consultation");
    setFormNotes("");
    setFormStatus("scheduled");
    setDialogOpen(true);
  }

  function openEditDialog(appt: Appointment) {
    setEditingAppointment(appt);
    setFormPatientId(appt.patientId || "");
    setFormTime(appt.time);
    setFormDuration(String(appt.duration));
    setFormType(appt.type);
    setFormNotes(appt.notes || "");
    setFormStatus(appt.status);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingAppointment) {
        await fetch(`/api/appointments/${editingAppointment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: formPatientId || null,
            date: dateISO,
            time: formTime,
            duration: Number(formDuration),
            type: formType,
            notes: formNotes,
            status: formStatus,
          }),
        });
      } else {
        await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: formPatientId || undefined,
            date: dateISO,
            time: formTime,
            duration: Number(formDuration),
            type: formType,
            notes: formNotes,
          }),
        });
      }
      setDialogOpen(false);
      fetchAppointments();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingAppointment) return;
    setSaving(true);
    try {
      await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: "DELETE",
      });
      setDialogOpen(false);
      fetchAppointments();
    } finally {
      setSaving(false);
    }
  }

  function getAppointmentForSlot(time: string): Appointment | undefined {
    return appointments.find((a) => a.time === time);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-teal-400" />
          Agenda
        </h1>
      </div>

      {/* Date Navigator */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="flex items-center justify-between py-4">
          <Button
            variant="ghost"
            onClick={() => navigateDay(-1)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Anterior
          </Button>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-200 capitalize">
              {formatDateBR(selectedDate)}
            </p>
            <p className="text-sm text-gray-500">{dateISO}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigateDay(1)}
            className="text-gray-400 hover:text-white"
          >
            Próximo
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-gray-200 flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-400" />
            Horários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Carregando...</p>
          ) : (
            TIME_SLOTS.map((time) => {
              const appt = getAppointmentForSlot(time);
              return (
                <div
                  key={time}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    appt
                      ? "bg-[#1a1a28] hover:bg-[#1e1e30]"
                      : "hover:bg-[#0e0e18]"
                  }`}
                  onClick={() =>
                    appt ? openEditDialog(appt) : openNewDialog(time)
                  }
                >
                  <span className="text-sm font-mono text-gray-400 w-14 shrink-0">
                    {time}
                  </span>
                  {appt ? (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-gray-200 font-medium truncate">
                        {appt.patient?.name || "Sem paciente"}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0 border-teal-500/30 text-teal-400"
                      >
                        {TYPE_LABELS[appt.type] || appt.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${STATUS_COLORS[appt.status] || ""}`}
                      >
                        {STATUS_LABELS[appt.status] || appt.status}
                      </Badge>
                      <span className="text-xs text-gray-500 shrink-0">
                        {appt.duration} min
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 text-gray-600 hover:text-gray-400">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Horário livre</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Appointment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#111118] border-[#1e1e2e] text-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Paciente</Label>
              <Select value={formPatientId} onValueChange={(v) => setFormPatientId(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue placeholder="Selecione um paciente (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="none">Sem paciente</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Horário</Label>
                <Select value={formTime} onValueChange={(v) => setFormTime(v ?? "")}>
                  <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400">Duração</Label>
                <Select value={formDuration} onValueChange={(v) => setFormDuration(v ?? "")}>
                  <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-400">Tipo</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="consultation">Consulta</SelectItem>
                  <SelectItem value="follow-up">Retorno</SelectItem>
                  <SelectItem value="first-visit">Primeira Consulta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingAppointment && (
              <div>
                <Label className="text-gray-400">Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v ?? "")}>
                  <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-gray-400">Observações</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Observações sobre o agendamento..."
                className="bg-[#0a0a0f] border-[#1e1e2e] min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              {editingAppointment && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Excluir
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
