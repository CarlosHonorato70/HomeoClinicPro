"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Video } from "lucide-react";
import Link from "next/link";

/* ───── Types ───── */

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
  meetingUrl: string | null;
  meetingRoomId: string | null;
}

type ViewMode = "day" | "week" | "month";

/* ───── Constants ───── */

const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7..20

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
  "first-visit": "1ª Consulta",
  teleconsulta: "Teleconsulta",
};

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/* ───── Date helpers ───── */

function fmtISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtBR(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function fmtWeekRange(start: Date, end: Date): string {
  const s = start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const e = end.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  return `${s} — ${e}`;
}

function fmtMonth(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Monday of the week containing d */
function getMonday(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Returns [monday..sunday] for the week containing d */
function getWeekDays(d: Date): Date[] {
  const mon = getMonday(d);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

/** Calendar grid dates for a month view (6 rows × 7 cols, starts Monday) */
function getMonthGrid(d: Date): Date[] {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const start = getMonday(first);
  // If Monday IS the 1st, great. Otherwise we go back.
  // Always show 6 weeks = 42 days for consistent grid
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/* ───── Main component ───── */

export default function AgendaPage() {
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(fmtISO(selectedDate));
  const [formPatientId, setFormPatientId] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formDuration, setFormDuration] = useState("30");
  const [formType, setFormType] = useState("consultation");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("scheduled");

  /* ── Computed date ranges (memoized to avoid infinite re-renders) ── */
  const dateISO = fmtISO(selectedDate);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [dateISO]);
  const weekFrom = useMemo(() => fmtISO(weekDays[0]), [weekDays]);
  const weekTo = useMemo(() => fmtISO(weekDays[6]), [weekDays]);
  const monthFromISO = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    return fmtISO(first);
  }, [dateISO]);
  const monthToISO = useMemo(() => {
    const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    return fmtISO(last);
  }, [dateISO]);
  const monthGrid = useMemo(() => getMonthGrid(selectedDate), [dateISO]);

  /* ── Fetch ── */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    let url = "/api/appointments";
    if (viewMode === "day") {
      url += `?date=${dateISO}`;
    } else if (viewMode === "week") {
      url += `?from=${weekFrom}&to=${weekTo}`;
    } else {
      url += `?from=${monthFromISO}&to=${monthToISO}`;
    }
    const res = await fetch(url);
    if (res.ok) setAppointments(await res.json());
    setLoading(false);
  }, [viewMode, dateISO, weekFrom, weekTo, monthFromISO, monthToISO]);

  const fetchPatients = useCallback(async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  /* ── Navigation ── */
  function navigate(dir: number) {
    const d = new Date(selectedDate);
    if (viewMode === "day") d.setDate(d.getDate() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setSelectedDate(d);
  }

  function goToday() { setSelectedDate(new Date()); }

  /* ── Dialog helpers ── */
  function openNewDialog(date: string, time: string) {
    setEditingAppointment(null);
    setFormDate(date);
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
    const apptDate = new Date(appt.date);
    setFormDate(fmtISO(apptDate));
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
            date: formDate,
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
            date: formDate,
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
      await fetch(`/api/appointments/${editingAppointment.id}`, { method: "DELETE" });
      setDialogOpen(false);
      fetchAppointments();
    } finally {
      setSaving(false);
    }
  }

  /* ── Appointment lookup helpers ── */
  function getForSlot(date: string, time: string): Appointment | undefined {
    return appointments.find((a) => {
      const d = fmtISO(new Date(a.date));
      return d === date && a.time === time;
    });
  }

  function getForDay(date: string): Appointment[] {
    return appointments.filter((a) => fmtISO(new Date(a.date)) === date);
  }

  /* ── Header label ── */
  const headerLabel = viewMode === "day"
    ? fmtBR(selectedDate)
    : viewMode === "week"
    ? fmtWeekRange(weekDays[0], weekDays[6])
    : fmtMonth(selectedDate);

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-teal-400" />
          Agenda
        </h1>
      </div>

      {/* View Tabs + Nav */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="py-4 space-y-3">
          {/* Tabs */}
          <div className="flex justify-center gap-1">
            {(["day", "week", "month"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === v
                    ? "bg-teal-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1e1e2e]"
                }`}
              >
                {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5 mr-1" /> Anterior
            </Button>
            <div className="text-center flex items-center gap-3">
              <p className="text-lg font-semibold text-gray-200 capitalize">{headerLabel}</p>
              <Button variant="outline" size="sm" onClick={goToday} className="text-xs border-[#1e1e2e] text-gray-400 hover:text-white">
                Hoje
              </Button>
            </div>
            <Button variant="ghost" onClick={() => navigate(1)} className="text-gray-400 hover:text-white">
              Próximo <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="py-12">
            <p className="text-center text-gray-500">Carregando...</p>
          </CardContent>
        </Card>
      ) : viewMode === "day" ? (
        /* ═══ DAY VIEW ═══ */
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-gray-200 flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-400" /> Horários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {TIME_SLOTS.map((time) => {
              const dateStr = fmtISO(selectedDate);
              const appt = getForSlot(dateStr, time);
              return (
                <div
                  key={time}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    appt ? "bg-[#1a1a28] hover:bg-[#1e1e30]" : "hover:bg-[#0e0e18]"
                  }`}
                  onClick={() => appt ? openEditDialog(appt) : openNewDialog(dateStr, time)}
                >
                  <span className="text-sm font-mono text-gray-400 w-14 shrink-0">{time}</span>
                  {appt ? (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-gray-200 font-medium truncate">
                        {appt.patient?.name || "Sem paciente"}
                      </span>
                      <Badge variant="outline" className={`text-xs shrink-0 ${appt.type === "teleconsulta" ? "border-indigo-500/30 text-indigo-400" : "border-teal-500/30 text-teal-400"}`}>
                        {appt.type === "teleconsulta" && "📹 "}{TYPE_LABELS[appt.type] || appt.type}
                      </Badge>
                      {appt.meetingUrl && (
                        <Link href={`/telemedicina/${appt.id}`} onClick={(e) => e.stopPropagation()} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded shrink-0">
                          Entrar
                        </Link>
                      )}
                      <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_COLORS[appt.status] || ""}`}>
                        {STATUS_LABELS[appt.status] || appt.status}
                      </Badge>
                      <span className="text-xs text-gray-500 shrink-0">{appt.duration} min</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 text-gray-600 hover:text-gray-400">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Horário livre</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : viewMode === "week" ? (
        /* ═══ WEEK VIEW ═══ */
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#1e1e2e]">
                <div className="p-2" />
                {weekDays.map((d) => {
                  const isToday = isSameDay(d, today);
                  return (
                    <div key={d.toISOString()} className={`p-2 text-center border-l border-[#1e1e2e] ${isToday ? "bg-teal-600/10" : ""}`}>
                      <p className="text-xs text-gray-500">{WEEKDAY_SHORT[d.getDay()]}</p>
                      <p className={`text-lg font-bold ${isToday ? "text-teal-400" : "text-gray-300"}`}>{d.getDate()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Time rows */}
              {HOURS.map((h) => (
                <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#1e1e2e]/50">
                  <div className="p-1 text-right pr-2">
                    <span className="text-xs font-mono text-gray-500">{String(h).padStart(2, "0")}:00</span>
                  </div>
                  {weekDays.map((d) => {
                    const dateStr = fmtISO(d);
                    const slotFull = `${String(h).padStart(2, "0")}:00`;
                    const slotHalf = `${String(h).padStart(2, "0")}:30`;
                    const apptFull = getForSlot(dateStr, slotFull);
                    const apptHalf = getForSlot(dateStr, slotHalf);
                    return (
                      <div key={dateStr + h} className="border-l border-[#1e1e2e]/50 min-h-[56px]">
                        {/* :00 slot */}
                        <div
                          className={`px-1 py-0.5 cursor-pointer min-h-[28px] transition-colors ${apptFull ? "bg-teal-900/20" : "hover:bg-[#0e0e18]"}`}
                          onClick={() => apptFull ? openEditDialog(apptFull) : openNewDialog(dateStr, slotFull)}
                        >
                          {apptFull && (
                            <div className="text-xs leading-tight">
                              <span className="text-teal-400 font-medium">{apptFull.time}</span>{" "}
                              <span className="text-gray-300 truncate">{apptFull.patient?.name?.split(" ")[0] || "—"}</span>
                            </div>
                          )}
                        </div>
                        {/* :30 slot */}
                        {h < 20 && (
                          <div
                            className={`px-1 py-0.5 cursor-pointer min-h-[28px] border-t border-[#1e1e2e]/20 transition-colors ${apptHalf ? "bg-teal-900/20" : "hover:bg-[#0e0e18]"}`}
                            onClick={() => apptHalf ? openEditDialog(apptHalf) : openNewDialog(dateStr, slotHalf)}
                          >
                            {apptHalf && (
                              <div className="text-xs leading-tight">
                                <span className="text-teal-400 font-medium">{apptHalf.time}</span>{" "}
                                <span className="text-gray-300 truncate">{apptHalf.patient?.name?.split(" ")[0] || "—"}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ═══ MONTH VIEW ═══ */
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-2">
            {/* Weekday header */}
            <div className="grid grid-cols-7 mb-1">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-[#1e1e2e]/30">
              {monthGrid.map((d, i) => {
                const dateStr = fmtISO(d);
                const isCurrentMonth = d.getMonth() === selectedDate.getMonth();
                const isToday = isSameDay(d, today);
                const dayAppts = getForDay(dateStr);
                const count = dayAppts.length;

                return (
                  <div
                    key={i}
                    className={`min-h-[80px] p-1 cursor-pointer transition-colors rounded-sm ${
                      isCurrentMonth ? "bg-[#111118]" : "bg-[#0a0a10]"
                    } ${isToday ? "ring-1 ring-teal-500/50" : ""} hover:bg-[#1a1a28]`}
                    onClick={() => {
                      setSelectedDate(d);
                      setViewMode("day");
                    }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-medium ${
                        isToday ? "bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center" :
                        isCurrentMonth ? "text-gray-300" : "text-gray-600"
                      }`}>
                        {d.getDate()}
                      </span>
                      {count > 0 && (
                        <span className={`text-xs px-1.5 rounded-full ${
                          count >= 5 ? "bg-red-500/20 text-red-400" :
                          count >= 3 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-teal-500/20 text-teal-400"
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                    {/* Mini cards - show up to 2 */}
                    {dayAppts.slice(0, 2).map((a) => (
                      <div key={a.id} className="text-xs leading-tight mb-0.5 truncate">
                        <span className="text-teal-400">{a.time}</span>{" "}
                        <span className="text-gray-400">{a.patient?.name?.split(" ")[0] || "—"}</span>
                      </div>
                    ))}
                    {count > 2 && (
                      <p className="text-xs text-gray-500">+{count - 2} mais</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Appointment Dialog (shared) ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#111118] border-[#1e1e2e] text-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date (visible when creating from week/month) */}
            <div>
              <Label className="text-gray-400">Data</Label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-[#0a0a0f] border-[#1e1e2e]"
              />
            </div>

            <div>
              <Label className="text-gray-400">Paciente</Label>
              <Select value={formPatientId} onValueChange={(v) => setFormPatientId(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue placeholder="Selecione um paciente (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="none">Sem paciente</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                      <SelectItem key={t} value={t}>{t}</SelectItem>
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
                  <SelectItem value="teleconsulta">📹 Teleconsulta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingAppointment?.meetingUrl && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-sm text-indigo-300 flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4" /> Link da Teleconsulta
                </p>
                <div className="flex gap-2">
                  <Link href={`/telemedicina/${editingAppointment.id}`} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md">
                    Entrar na Sala
                  </Link>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 px-2" onClick={() => navigator.clipboard.writeText(editingAppointment.meetingUrl!)}>
                    Copiar Link
                  </button>
                </div>
              </div>
            )}

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
                <Button variant="destructive" onClick={handleDelete} disabled={saving}>Excluir</Button>
              )}
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-gray-400">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
