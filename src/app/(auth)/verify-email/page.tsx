"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "Verificando seu email..." : "Token de verificação não encontrado."
  );

  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verificado com sucesso!");
        } else {
          setStatus("error");
          setMessage(data.error || "Erro ao verificar email.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de conexão. Tente novamente.");
      });
  }, [token]);

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111118] p-8 text-center">
      {status === "loading" && (
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-500" />
      )}
      {status === "success" && (
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
      )}
      {status === "error" && (
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
      )}

      <h1 className="mt-4 text-xl font-bold text-gray-100">
        {status === "loading"
          ? "Verificando..."
          : status === "success"
            ? "Email Verificado!"
            : "Erro na Verificação"}
      </h1>

      <p className="mt-2 text-sm text-gray-400">{message}</p>

      {status !== "loading" && (
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
        >
          Ir para Login
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111118] p-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-500" />
            <p className="mt-4 text-sm text-gray-400">Carregando...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
