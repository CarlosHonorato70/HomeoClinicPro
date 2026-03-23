import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SUPPORT_SYSTEM_PROMPT } from "@/lib/support-knowledge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serviço de suporte temporariamente indisponível" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { message, history } = body as {
      message: string;
      history: Message[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Mensagem não pode estar vazia" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Mensagem muito longa (máximo 2000 caracteres)" },
        { status: 400 }
      );
    }

    // Keep only last 20 messages for context
    const recentHistory = (history || []).slice(-20).map((m: Message) => ({
      role: m.role,
      content: m.content.slice(0, 1000),
    }));

    const messages = [
      { role: "system" as const, content: SUPPORT_SYSTEM_PROMPT },
      ...recentHistory,
      { role: "user" as const, content: message.trim() },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { error: "Erro ao processar sua pergunta. Tente novamente." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui gerar uma resposta. Tente reformular sua pergunta.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Support chat error:", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em alguns instantes." },
      { status: 500 }
    );
  }
}
