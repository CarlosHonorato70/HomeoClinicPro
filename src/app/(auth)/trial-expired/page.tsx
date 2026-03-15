"use client";

import Link from "next/link";
import { Clock, CreditCard, ArrowRight } from "lucide-react";

export default function TrialExpiredPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111118] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
          <Clock className="h-8 w-8 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-100">
          Período de Teste Encerrado
        </h1>

        <p className="mt-3 text-gray-400">
          Seu período de teste gratuito de 14 dias expirou. Para continuar
          usando o HomeoClinic Pro com todos os recursos, assine um plano.
        </p>

        <div className="mt-6 rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
          <div className="flex items-center justify-center gap-2 text-teal-400">
            <CreditCard className="h-5 w-5" />
            <span className="font-semibold">Plano Profissional</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">
            R$ 149<span className="text-sm font-normal text-gray-400">/mês</span>
          </p>
          <ul className="mt-3 space-y-1 text-left text-sm text-gray-300">
            <li>- 500 pacientes</li>
            <li>- 3 usuários</li>
            <li>- Consultas ilimitadas</li>
            <li>- Repertorização avançada</li>
            <li>- Suporte prioritário</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/settings/billing"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
          >
            Assinar Agora
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}
