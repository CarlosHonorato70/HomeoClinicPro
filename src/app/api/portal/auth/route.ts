import { NextResponse } from "next/server";
import { authenticatePatient } from "@/lib/patient-auth";

export async function POST(req: Request) {
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
}
