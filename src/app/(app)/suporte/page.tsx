"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Headphones,
  Send,
  Bot,
  User,
  BookOpen,
  Mail,
  MessageCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FAQ_ITEMS = [
  {
    q: "Como cadastro um novo paciente?",
    a: "Vá em Pacientes > clique em 'Novo Paciente' > preencha os dados e marque o consentimento LGPD > clique em 'Cadastrar Paciente'.",
  },
  {
    q: "Como faço a anamnese homeopática?",
    a: "Abra a ficha do paciente > aba 'Anamnese Homeopática' > escolha o template (Clássica, Pediatria, Psiquiatria, etc.) > preencha as seções ou use o microfone para gravar por voz > clique em 'Salvar Anamnese'.",
  },
  {
    q: "Como funciona a transcrição por voz?",
    a: "Na consulta ou anamnese, clique no ícone de microfone > fale naturalmente > clique em 'Parar' > a IA transcreve automaticamente o áudio e insere no campo. O paciente deve consentir com a gravação (LGPD).",
  },
  {
    q: "Como usar o Assistente de IA?",
    a: "Menu lateral > Assistente IA > descreva os sintomas > a IA identifica rubricas > selecione as relevantes > repertorize > a IA sugere remédio, potência e posologia. Lembre-se: a decisão final é sempre do profissional.",
  },
  {
    q: "Como emitir uma receita?",
    a: "Pacientes > [Paciente] > Documentos > 'Novo Documento' > selecione 'Receituário' > adicione medicamentos com dosagem e frequência > 'Criar Documento'.",
  },
  {
    q: "Como funciona a telemedicina?",
    a: "Agende uma consulta do tipo 'Teleconsulta' na Agenda. No dia/hora, vá em Telemedicina e clique 'Entrar'. Compartilhe o link com o paciente. O prontuário fica aberto lado a lado.",
  },
  {
    q: "Quais são os planos disponíveis?",
    a: "Gratuito (10 pacientes, 1 usuário), Profissional R$197/mês (500 pacientes, 3 usuários, IA completa), Enterprise R$497/mês (ilimitado, 12 usuários, multi-clínica). Todos com 14 dias grátis.",
  },
  {
    q: "Como configuro os lembretes por WhatsApp?",
    a: "Configurações > WhatsApp > escaneie o QR Code com seu celular > configure o horário de envio dos lembretes (24h antes, 1h antes, etc.).",
  },
];

export default function SuportePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      const userMsg: Message = { role: "user", content: msg };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, history: messages.slice(-18) }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Desculpe, ocorreu um erro. Tente novamente ou entre em contato pelo email contato@homeoclinic-ia.com.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Headphones className="h-7 w-7 text-teal-500" />
        <div>
          <h1 className="text-2xl font-bold">Central de Suporte</h1>
          <p className="text-sm text-zinc-400">
            Tire suas dúvidas com a Clara, nossa assistente virtual, ou consulte o FAQ
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat - 2 cols */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
            <Bot className="h-5 w-5 text-teal-500" />
            <div>
              <p className="text-sm font-semibold">Clara — Assistente Virtual</p>
              <p className="text-xs text-zinc-500">Disponível 24/7</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" style={{ minHeight: 350, maxHeight: 500 }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Bot className="h-12 w-12 text-teal-500" />
                <p className="text-zinc-400">
                  Olá! Sou a <strong className="text-teal-400">Clara</strong>. Como posso ajudar?
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {["Como cadastro um paciente?", "Como funciona a IA?", "Quais os planos?", "Como gravar consulta?"].map(
                    (q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-teal-600 hover:text-teal-400"
                      >
                        {q}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-teal-700 text-white" : "bg-zinc-800 text-zinc-200"
                  }`}
                >
                  {m.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
                {m.role === "user" && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-4 w-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl bg-zinc-800 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2 border-t border-zinc-800 p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-teal-600"
              maxLength={2000}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Sidebar - links + FAQ */}
        <div className="space-y-4">
          {/* Quick links */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">Links Úteis</h2>
            <div className="space-y-2">
              <a
                href="/docs/guia-de-uso-homeoclinic-pro.pdf"
                target="_blank"
                className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-teal-600 hover:text-teal-400"
              >
                <Download className="h-4 w-4 text-teal-500" />
                Guia de Uso (PDF)
              </a>
              <a
                href="mailto:contato@homeoclinic-ia.com"
                className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-teal-600 hover:text-teal-400"
              >
                <Mail className="h-4 w-4 text-teal-500" />
                contato@homeoclinic-ia.com
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-teal-600 hover:text-teal-400"
              >
                <MessageCircle className="h-4 w-4 text-teal-500" />
                WhatsApp Suporte
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">Perguntas Frequentes</h2>
            <div className="space-y-1">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border-b border-zinc-800 last:border-0">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="flex w-full items-center justify-between py-2.5 text-left text-sm text-zinc-300 transition hover:text-teal-400"
                  >
                    <span>{item.q}</span>
                    {expandedFaq === i ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
                    )}
                  </button>
                  {expandedFaq === i && (
                    <p className="pb-3 text-xs leading-relaxed text-zinc-400">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
