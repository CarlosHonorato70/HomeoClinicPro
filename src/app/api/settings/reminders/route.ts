import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requirePermission(session, "manage_clinic");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    reminderHours: JSON.parse(config.reminderHours || "[24,2]"),
    whatsappPhoneId: config.whatsappPhoneId,
    // Don't expose the actual token, just indicate if it's set
    hasWhatsappToken: !!config.whatsappToken,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requirePermission(session, "manage_clinic");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const data: Record<string, unknown> = {
    emailEnabled: body.emailEnabled ?? true,
    whatsappEnabled: body.whatsappEnabled ?? false,
    smsEnabled: body.smsEnabled ?? false,
    reminderHours: JSON.stringify(body.reminderHours ?? [24, 2]),
    whatsappPhoneId: body.whatsappPhoneId || null,
  };

  // Only update token if provided
  if (body.whatsappToken) {
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
    reminderHours: JSON.parse(config.reminderHours || "[24,2]"),
    whatsappPhoneId: config.whatsappPhoneId,
    hasWhatsappToken: !!config.whatsappToken,
  });
}
