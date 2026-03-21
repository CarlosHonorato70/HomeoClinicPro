"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Stethoscope,
  FileText,
  Calendar,
  DollarSign,
  ClipboardList,
  Clock,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "consultation" | "document" | "appointment" | "financial" | "anamnesis";
  date: string;
  title: string;
  summary: string;
  link?: string;
}

const typeConfig = {
  consultation: {
    icon: Stethoscope,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
  },
  document: {
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
  },
  appointment: {
    icon: Calendar,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500",
  },
  financial: {
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
  },
  anamnesis: {
    icon: ClipboardList,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500",
  },
};

export default function PatientTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${id}/timeline`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events || []);
        setPatientName(data.patientName || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group events by month
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const d = new Date(event.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const monthLabel = (key: string) => {
    const [year, month] = key.split("-");
    const d = new Date(Number(year), Number(month) - 1);
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Timeline
        </h1>
        <p className="text-muted-foreground">{patientName}</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum registro encontrado para este paciente</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-8">
            {Object.entries(grouped).map(([monthKey, monthEvents]) => (
              <div key={monthKey}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 capitalize">
                  {monthLabel(monthKey)}
                </h2>
                <div className="relative pl-6 border-l-2 border-muted space-y-3">
                  {monthEvents.map((event) => {
                    const config = typeConfig[event.type];
                    const Icon = config.icon;
                    return (
                      <div key={`${event.type}-${event.id}`} className="relative">
                        <div
                          className={`absolute -left-[29px] p-1 rounded-full ${config.bgColor}`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                        </div>
                        <Card
                          className={`cursor-pointer hover:bg-accent/30 transition-colors border-l-2 ${config.borderColor}`}
                          onClick={() => event.link && (window.location.href = event.link)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] py-0">
                                  {event.title}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(event.date)} {formatTime(event.date)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.summary}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
