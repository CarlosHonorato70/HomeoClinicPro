import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAsaasSubscription } from "@/lib/asaas";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    requirePermission(session, "manage_billing");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { priceId, plan } = await req.json();

  // Accept either plan name or priceId for backwards compatibility
  const planKey = plan ?? priceId;

  if (!planKey || (planKey !== "professional" && planKey !== "enterprise")) {
    return NextResponse.json(
      { error: "Plano deve ser 'professional' ou 'enterprise'" },
      { status: 400 }
    );
  }

  try {
    const origin = new URL(req.url).origin;
    const { paymentUrl } = await createAsaasSubscription(
      session.user.clinicId,
      planKey as "professional" | "enterprise",
      `${origin}/settings/billing?success=true`
    );

    return NextResponse.json({ url: paymentUrl });
  } catch (err) {
    console.error("Error creating Asaas subscription:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao criar assinatura";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
