"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao enviar email.");
        return;
      }

      setSent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-teal-500" />
          </div>
          <CardTitle className="text-xl">Email Enviado</CardTitle>
          <CardDescription className="text-gray-400">
            Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
            Verifique também a pasta de spam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-xl">Esqueceu sua senha?</CardTitle>
        <CardDescription className="text-gray-400">
          Digite seu email para receber um link de recuperação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {loading ? "Enviando..." : "Enviar Link de Recuperação"}
          </Button>

          <Link href="/login">
            <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao login
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
