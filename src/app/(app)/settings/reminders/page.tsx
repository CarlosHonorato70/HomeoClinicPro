"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Save, Clock, QrCode, Wifi, WifiOff, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ReminderConfig {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  reminderHours: number[];
  whatsappPhoneId: string | null;
  hasWhatsappToken?: boolean;
}

interface WhatsAppStatus {
  connected: boolean;
  state: string;
  qrcode?: string;
  pairingCode?: string;
}

export default function RemindersSettingsPage() {
  const [config, setConfig] = useState<ReminderConfig>({
    emailEnabled: true,
    whatsappEnabled: false,
    smsEnabled: false,
    reminderHours: [24, 2],
    whatsappPhoneId: null,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // WhatsApp Evolution state
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>({ connected: false, state: "unknown" });
  const [waLoading, setWaLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/reminders")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Check WhatsApp status
  const checkWaStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/whatsapp");
      if (res.ok) {
        const data = await res.json();
        setWaStatus({ connected: data.connected, state: data.state });
        if (data.connected) setQrCode(null);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    checkWaStatus();
  }, [checkWaStatus]);

  // Poll status while QR is showing
  useEffect(() => {
    if (!qrCode) return;
    const interval = setInterval(async () => {
      await checkWaStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [qrCode, checkWaStatus]);

  // Auto-clear QR when connected
  useEffect(() => {
    if (waStatus.connected && qrCode) {
      setQrCode(null);
      toast.success("WhatsApp conectado com sucesso!");
    }
  }, [waStatus.connected, qrCode]);

  const handleConnectWhatsApp = async () => {
    setWaLoading(true);
    try {
      const res = await fetch("/api/settings/whatsapp", { method: "POST" });
      const data = await res.json();

      if (data.connected) {
        setWaStatus({ connected: true, state: "open" });
        toast.success("WhatsApp ja esta conectado!");
      } else if (data.qrcode) {
        setQrCode(data.qrcode);
        toast.info("Escaneie o QR code com seu WhatsApp");
      } else {
        toast.error(data.error || "Falha ao gerar QR code");
      }
    } catch {
      toast.error("Erro ao conectar WhatsApp");
    } finally {
      setWaLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    setWaLoading(true);
    try {
      const res = await fetch("/api/settings/whatsapp", { method: "DELETE" });
      if (res.ok) {
        setWaStatus({ connected: false, state: "close" });
        setQrCode(null);
        toast.success("WhatsApp desconectado");
      }
    } catch {
      toast.error("Erro ao desconectar");
    } finally {
      setWaLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
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
                setConfig((prev) => ({ ...prev, emailEnabled: !prev.emailEnabled }))
              }
            >
              {config.emailEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp via Evolution API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp
            {waStatus.connected ? (
              <Badge variant="default" className="ml-2 bg-green-600">
                <Wifi className="h-3 w-3 mr-1" /> Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 text-gray-400">
                <WifiOff className="h-3 w-3 mr-1" /> Desconectado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Conecte seu WhatsApp para enviar lembretes automáticos aos pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enviar lembretes por WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Requer telefone cadastrado do paciente
              </p>
            </div>
            <Button
              variant={config.whatsappEnabled ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, whatsappEnabled: !prev.whatsappEnabled }))
              }
            >
              {config.whatsappEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>

          {config.whatsappEnabled && (
            <div className="space-y-4 pt-3 border-t">
              {/* Connection controls */}
              {!waStatus.connected && !qrCode && (
                <Button
                  onClick={handleConnectWhatsApp}
                  disabled={waLoading}
                  className="w-full"
                  variant="outline"
                >
                  {waLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  Conectar WhatsApp
                </Button>
              )}

              {/* QR Code display */}
              {qrCode && !waStatus.connected && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-400">
                    Abra o WhatsApp no celular &gt; Menu &gt; Aparelhos conectados &gt; Conectar um aparelho
                  </p>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                        alt="QR Code WhatsApp"
                        width={256}
                        height={256}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-amber-400">
                    Aguardando leitura do QR code...
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleConnectWhatsApp}
                    disabled={waLoading}
                  >
                    Gerar novo QR code
                  </Button>
                </div>
              )}

              {/* Connected state */}
              {waStatus.connected && (
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm text-green-400 font-medium">
                        WhatsApp conectado
                      </p>
                      <p className="text-xs text-gray-400">
                        Lembretes serão enviados automaticamente
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnectWhatsApp}
                    disabled={waLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Desconectar
                  </Button>
                </div>
              )}
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
