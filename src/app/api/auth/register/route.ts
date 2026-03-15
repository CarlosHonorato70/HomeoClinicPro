import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const TRIAL_DAYS = 14;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, clinicName, name } = body;

    // Validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    if (!clinicName || typeof clinicName !== "string" || clinicName.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da clínica é obrigatório." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 }
      );
    }

    // Create clinic + user
    const passwordHash = await bcrypt.hash(password, 12);
    const userName = name?.trim() || email.split("@")[0];
    const verificationToken = randomBytes(32).toString("hex");

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName.trim(),
        subscriptionStatus: "trialing",
        trialEndsAt,
      },
    });

    const user = await prisma.user.create({
      data: {
        clinicId: clinic.id,
        name: userName,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "admin",
        emailVerificationToken: verificationToken,
      },
    });

    // Send verification + welcome emails (non-blocking)
    sendVerificationEmail(user.email, userName, verificationToken).catch((err) =>
      console.error("[register] Failed to send verification email:", err)
    );
    sendWelcomeEmail(user.email, userName).catch((err) =>
      console.error("[register] Failed to send welcome email:", err)
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Conta criada com sucesso! Verifique seu email para ativar a conta.",
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
