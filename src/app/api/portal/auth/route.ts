import { NextResponse } from "next/server";
import { authenticatePatient } from "@/lib/patient-auth";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Rate limit: 5 attempts per minute per IP
    const rl = rateLimit(`portal-auth:${ip}`, 5, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 1 minuto." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await authenticatePatient(email, password);

    if (!result) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: result.token,
      patientId: result.patientId,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro de autenticação";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
