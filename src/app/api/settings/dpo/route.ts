import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clinicSettingsSchema } from "@/lib/validations";
import { logAudit, AuditActions } from "@/lib/audit";
import { requirePermission } from "@/lib/rbac";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    requirePermission(session, "manage_clinic");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.user.clinicId },
    select: {
      dpoName: true,
      dpoEmail: true,
      name: true,
      cnpj: true,
      phone: true,
      email: true,
      address: true,
      crm: true,
    },
  });

  if (!clinic) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  return NextResponse.json(clinic);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    requirePermission(session, "manage_clinic");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = clinicSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const clinic = await prisma.clinic.update({
    where: { id: session.user.clinicId },
    data: {
      ...(data.dpoName !== undefined && { dpoName: data.dpoName }),
      ...(data.dpoEmail !== undefined && { dpoEmail: data.dpoEmail }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.crm !== undefined && { crm: data.crm }),
    },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.SETTINGS_SAVE,
    details: "Configurações da clínica e DPO atualizadas",
  });

  return NextResponse.json({
    dpoName: clinic.dpoName,
    dpoEmail: clinic.dpoEmail,
    name: clinic.name,
    cnpj: clinic.cnpj,
    phone: clinic.phone,
    email: clinic.email,
    address: clinic.address,
    crm: clinic.crm,
  });
}
