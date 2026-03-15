"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Build mailto link as simple contact method
    const subject = encodeURIComponent(
      `[HomeoClinic Pro] ${data.get("subject") || "Contato"}`
    );
    const body = encodeURIComponent(
      `Nome: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:contato@homeoclinic-ia.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-100">Contato</h1>
      <p className="mb-8 text-gray-400">
        Tem dúvidas, sugestões ou precisa de suporte? Entre em contato conosco.
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
              <Mail className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Email</h3>
              <p className="text-sm text-gray-400">contato@homeoclinic-ia.com</p>
              <p className="text-sm text-gray-500">Respondemos em até 24h</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
              <MapPin className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Localização</h3>
              <p className="text-sm text-gray-400">São Paulo, SP — Brasil</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
              <Clock className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Suporte</h3>
              <p className="text-sm text-gray-400">Segunda a Sexta, 9h - 18h</p>
              <p className="text-sm text-gray-500">Horário de Brasília</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#111118] p-4">
            <h3 className="mb-2 font-semibold text-gray-100">DPO (LGPD)</h3>
            <p className="text-sm text-gray-400">
              Para questões sobre proteção de dados pessoais, entre em contato
              com nosso Encarregado pelo email:
            </p>
            <p className="mt-1 text-sm font-medium text-teal-400">
              dpo@homeoclinic-ia.com
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-[#111118] p-12 text-center">
              <div>
                <Send className="mx-auto h-12 w-12 text-teal-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-100">
                  Obrigado pelo contato!
                </h2>
                <p className="mt-2 text-gray-400">
                  Seu cliente de email deve ter aberto com a mensagem. Se
                  preferir, envie diretamente para contato@homeoclinic-ia.com.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-white/10 bg-[#111118] p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Nome
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Assunto
                </label>
                <select
                  name="subject"
                  className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Dúvida">Dúvida</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Comercial">Comercial / Planos</option>
                  <option value="LGPD">LGPD / Proteção de Dados</option>
                  <option value="Sugestão">Sugestão de Melhoria</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
              >
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
