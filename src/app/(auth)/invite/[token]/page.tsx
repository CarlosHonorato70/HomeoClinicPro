"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

interface InviteInfo {
  email: string;
  role: string;
  clinicName: string;
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/info?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Convite inválido");
          return;
        }
        const data = await res.json();
        setInvite(data);
      } catch {
        setError("Erro ao carregar informações do convite");
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao aceitar convite");
      }

      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao aceitar convite";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "doctor":
        return "Médico";
      default:
        return role;
    }
  };

  const inputClassName = "bg-[#111118] border-white/10 text-gray-200";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando convite...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#111118] border-[#1e1e2e]">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-teal-400" />
            </div>
          </div>
          <CardTitle className="text-xl text-gray-200">
            Convite Recebido
          </CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            Voc&ecirc; foi convidado para{" "}
            <span className="text-teal-400 font-medium">
              {invite?.clinicName}
            </span>{" "}
            como{" "}
            <span className="text-teal-400 font-medium">
              {roleLabel(invite?.role || "")}
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={invite?.email || ""}
                disabled
                className="bg-[#0a0a0f] border-white/10 text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Nome Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Confirmar Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                required
                minLength={6}
                className={inputClassName}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar Conta e Aceitar Convite"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
