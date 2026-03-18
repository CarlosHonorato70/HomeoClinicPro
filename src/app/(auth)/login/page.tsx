"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Stethoscope } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isNewUser) {
        // Register first, then auto-login
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            clinicName,
            name: name || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erro ao criar conta.");
          setLoading(false);
          return;
        }

        // Auto-login after successful registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Conta criada, mas erro ao entrar. Faça login manualmente.");
          setIsNewUser(false);
          setLoading(false);
          return;
        }
      } else {
        // Login only
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-teal-500" />
          <CardTitle className="text-2xl font-bold">
            Homeo<span className="text-teal-500">Clinic</span> Pro
          </CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Sistema de Prontuário Eletrônico Homeopático
        </CardDescription>
        <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Protegido por criptografia AES-256 | LGPD</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isNewUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Clínica Homeopática"
                  required
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. João Silva"
                  className="bg-[#16161f] border-[#2a2a3a]"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="medico@clinica.com"
              required
              className="bg-[#16161f] border-[#2a2a3a]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              {!isNewUser && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres (maiúscula, número, especial)"
              required
              minLength={8}
              className="bg-[#16161f] border-[#2a2a3a]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {loading
              ? isNewUser
                ? "Criando conta..."
                : "Entrando..."
              : isNewUser
                ? "Criar Conta"
                : "Entrar"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
            onClick={() => {
              setIsNewUser(!isNewUser);
              setError("");
            }}
          >
            {isNewUser ? "Já tenho conta" : "Primeiro acesso? Criar conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
