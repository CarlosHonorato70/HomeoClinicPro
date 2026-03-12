import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await req.json();

  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json(
      { error: "priceId é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const origin = new URL(req.url).origin;
    const checkoutSession = await createCheckoutSession(
      session.user.clinicId,
      priceId,
      `${origin}/settings/billing?success=true`,
      `${origin}/settings/billing?canceled=true`
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    const message =
      err instanceof Error ? err.message : "Erro ao criar sessão de checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
