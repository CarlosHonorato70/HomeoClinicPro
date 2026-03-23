import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAsaasPaymentUrl } from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const clinic = await prisma.clinic.findUniqueOrThrow({
      where: { id: session.user.clinicId },
      select: { stripeCustomerId: true },
    });

    if (!clinic.stripeCustomerId) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada. Faça upgrade primeiro." },
        { status: 400 }
      );
    }

    const url = await getAsaasPaymentUrl(clinic.stripeCustomerId);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Error fetching Asaas portal:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao abrir portal de cobrança";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
