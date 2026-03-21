import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { encrypt } from "@/lib/encryption";

function safeParseJSON(str: string | null | undefined, fallback: unknown): unknown {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    requirePermission(session, "manage_clinic");

    const config = await prisma.reminderConfig.findUnique({
      where: { clinicId: session.user.clinicId },
    });

    if (!config) {
      return NextResponse.json({
        emailEnabled: true,
        whatsappEnabled: false,
        smsEnabled: false,
        reminderHours: [24, 2],
        whatsappPhoneId: null,
      });
    }

    return NextResponse.json({
      emailEnabled: config.emailEnabled,
      whatsappEnabled: config.whatsappEnabled,
      smsEnabled: config.smsEnabled,
      reminderHours: safeParseJSON(config.reminderHours, [24, 2]),
      whatsappPhoneId: config.whatsappPhoneId,
      hasWhatsappToken: !!config.whatsappToken,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("permissão") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    requirePermission(session, "manage_clinic");

    const body = await req.json();

    // Validate reminderHours
    const reminderHours = Array.isArray(body.reminderHours)
      ? body.reminderHours.filter((h: unknown) => typeof h === "number" && h > 0)
      : [24, 2];

    const data: Record<string, unknown> = {
      emailEnabled: body.emailEnabled === true,
      whatsappEnabled: body.whatsappEnabled === true,
      smsEnabled: body.smsEnabled === true,
      reminderHours: JSON.stringify(reminderHours),
      whatsappPhoneId: body.whatsappPhoneId || null,
    };

    if (body.whatsappToken && typeof body.whatsappToken === "string") {
      data.whatsappToken = encrypt(body.whatsappToken);
    }

    const config = await prisma.reminderConfig.upsert({
      where: { clinicId: session.user.clinicId },
      update: data,
      create: {
        clinicId: session.user.clinicId,
        ...data,
      },
    });

    return NextResponse.json({
      emailEnabled: config.emailEnabled,
      whatsappEnabled: config.whatsappEnabled,
      smsEnabled: config.smsEnabled,
      reminderHours: safeParseJSON(config.reminderHours, [24, 2]),
      whatsappPhoneId: config.whatsappPhoneId,
      hasWhatsappToken: !!config.whatsappToken,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("permissão") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
