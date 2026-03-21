"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Save, Clock } from "lucide-react";
import { toast } from "sonner";

interface ReminderConfig {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  reminderHours: number[];
  whatsappPhoneId: string | null;
  hasWhatsappToken?: boolean;
}

export default function RemindersSettingsPage() {
  const [config, setConfig] = useState<ReminderConfig>({
    emailEnabled: true,
    whatsappEnabled: false,
    smsEnabled: false,
    reminderHours: [24, 2],
    whatsappPhoneId: null,
  });
  const [whatsappToken, setWhatsappToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/reminders")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...config };
      if (whatsappToken) body.whatsappToken = whatsappToken;

      const res = await fetch("/api/settings/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setWhatsappToken("");
        toast.success("Configurações de lembretes salvas!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const toggleHour = (hour: number) => {
    setConfig((prev) => ({
      ...prev,
      reminderHours: prev.reminderHours.includes(hour)
        ? prev.reminderHours.filter((h) => h !== hour)
        : [...prev.reminderHours, hour].sort((a, b) => b - a),
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Lembretes de Consulta
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure lembretes automáticos para seus pacientes
        </p>
      </div>

      {/* Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quando enviar
          </CardTitle>
          <CardDescription>
            Selecione com quantas horas de antecedência enviar lembretes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[48, 24, 12, 6, 2, 1].map((hour) => (
              <Badge
                key={hour}
                variant={config.reminderHours.includes(hour) ? "default" : "outline"}
                className="cursor-pointer text-sm px-3 py-1"
                onClick={() => toggleHour(hour)}
              >
                {hour}h antes
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enviar lembretes por email</p>
              <p className="text-xs text-muted-foreground">
                Requer email cadastrado do paciente
              </p>
            </div>
            <Button
              variant={config.emailEnabled ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  emailEnabled: !prev.emailEnabled,
                }))
              }
            >
              {config.emailEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Business API
          </CardTitle>
          <CardDescription>
            Envie lembretes via WhatsApp oficial da Meta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enviar lembretes por WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Requer conta WhatsApp Business API
              </p>
            </div>
            <Button
              variant={config.whatsappEnabled ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  whatsappEnabled: !prev.whatsappEnabled,
                }))
              }
            >
              {config.whatsappEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>

          {config.whatsappEnabled && (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label htmlFor="phoneId">Phone Number ID</Label>
                <Input
                  id="phoneId"
                  placeholder="Ex: 123456789012345"
                  value={config.whatsappPhoneId || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whatsappPhoneId: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="token">
                  Access Token{" "}
                  {config.hasWhatsappToken && (
                    <span className="text-xs text-green-600">(configurado)</span>
                  )}
                </Label>
                <Input
                  id="token"
                  type="password"
                  placeholder={
                    config.hasWhatsappToken
                      ? "Deixe em branco para manter o atual"
                      : "Cole seu token de acesso"
                  }
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O token é criptografado antes de ser armazenado
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
}
