"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, Lock, User } from "lucide-react";

interface PortalData {
  appointments: {
    id: string;
    date: string;
    time: string;
    type: string;
    status: string;
  }[];
  documents: {
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }[];
}

export default function PatientPortalPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PortalData | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao fazer login");
        return;
      }

      const { token: newToken } = await res.json();
      setToken(newToken);

      // Fetch portal data
      const headers = { Authorization: `Bearer ${newToken}` };
      const [apptRes, docRes] = await Promise.all([
        fetch("/api/portal/appointments", { headers }),
        fetch("/api/portal/documents", { headers }),
      ]);

      const appointments = apptRes.ok ? (await apptRes.json()).appointments : [];
      const documents = docRes.ok ? (await docRes.json()).documents : [];

      setData({ appointments, documents });
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR");

  const typeLabels: Record<string, string> = {
    prescription: "Receita",
    certificate: "Atestado",
    report: "Laudo",
    tcle: "TCLE",
    consultation: "Consulta",
    "follow-up": "Retorno",
    "first-visit": "Primeira consulta",
    teleconsulta: "Teleconsulta",
  };

  // Login screen
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-2">
              <User className="h-6 w-6 text-teal-500" />
            </div>
            <CardTitle>Portal do Paciente</CardTitle>
            <CardDescription>
              Acesse seus documentos e consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Portal dashboard
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Portal do Paciente</h1>
        <p className="text-muted-foreground text-sm">
          Bem-vindo! Aqui você pode ver seus agendamentos e documentos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-teal-500" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma consulta agendada
              </p>
            ) : (
              <div className="space-y-3">
                {data?.appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(appt.date)} às {appt.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[appt.type] || appt.type}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-500">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-purple-500" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum documento disponível
              </p>
            ) : (
              <div className="space-y-3">
                {data?.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[doc.type] || doc.type} —{" "}
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
