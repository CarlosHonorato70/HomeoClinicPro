import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token de verificação não fornecido." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Token inválido ou já utilizado." },
      { status: 400 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Email já verificado." });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Email verificado com sucesso!",
  });
}
