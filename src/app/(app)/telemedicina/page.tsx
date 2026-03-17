"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface TeleconsultaAppointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  meetingUrl: string | null;
  notes: string | null;
  patient: { id: string; name: string; phone: string | null } | null;
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

export default function TelemedicinListPage() {
  const [appointments, setAppointments] = useState<TeleconsultaAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  const fetchTeleconsultas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?type=teleconsulta&filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchTeleconsultas();
  }, [fetchTeleconsultas]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const nowTime = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && (a.date > todayStr || (a.date === todayStr && a.time >= nowTime))
  );
  const past = appointments.filter(
    (a) => a.status === "cancelled" || (a.date < todayStr || (a.date === todayStr && a.time < nowTime))
  );

  const displayList = filter === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-indigo-400" />
          Telemedicina
        </h1>
        <Link href="/agenda">
          <Button variant="outline" className="border-[#1e1e2e] text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar na Agenda
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("upcoming")}
          className={filter === "upcoming" ? "bg-indigo-600 hover:bg-indigo-700" : "border-[#1e1e2e] text-gray-400"}
        >
          Próximas ({upcoming.length})
        </Button>
        <Button
          variant={filter === "past" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("past")}
          className={filter === "past" ? "bg-indigo-600 hover:bg-indigo-700" : "border-[#1e1e2e] text-gray-400"}
        >
          Anteriores ({past.length})
        </Button>
      </div>

      {/* Teleconsulta List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-[#111118] border-[#1e1e2e] animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-[#1e1e2e] rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="py-16 text-center">
            <VideoOff className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {filter === "upcoming"
                ? "Nenhuma teleconsulta agendada."
                : "Nenhuma teleconsulta anterior."}
            </p>
            <Link href="/agenda" className="text-indigo-400 hover:underline text-sm mt-2 block">
              Agendar teleconsulta na Agenda
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayList.map((appt) => {
            const isToday = appt.date === todayStr;
            const isPast = appt.date < todayStr || (appt.date === todayStr && appt.time < nowTime);
            const canJoin = appt.meetingUrl && !isPast && appt.status !== "cancelled";

            return (
              <Card
                key={appt.id}
                className={`bg-[#111118] border-[#1e1e2e] transition-colors ${
                  canJoin ? "hover:border-indigo-500/40" : ""
                }`}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Date/Time */}
                      <div className="text-center shrink-0 w-20">
                        <p className={`text-sm font-bold ${isToday ? "text-indigo-400" : "text-gray-300"}`}>
                          {new Date(appt.date + "T12:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                        <p className="text-lg font-mono text-gray-200">{appt.time}</p>
                        <p className="text-xs text-gray-500">{appt.duration} min</p>
                      </div>

                      {/* Patient & Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-200 truncate">
                            {appt.patient?.name || "Sem paciente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs ${STATUS_COLORS[appt.status] || ""}`}
                          >
                            {STATUS_LABELS[appt.status] || appt.status}
                          </Badge>
                          {isToday && (
                            <Badge className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                              Hoje
                            </Badge>
                          )}
                          {appt.notes && (
                            <span className="text-xs text-gray-500 truncate max-w-48">
                              {appt.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {canJoin ? (
                        <Link href={`/telemedicina/${appt.id}`}>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <Video className="h-4 w-4 mr-1" />
                            Entrar
                          </Button>
                        </Link>
                      ) : appt.meetingUrl && isPast ? (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-500">
                          Encerrada
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
