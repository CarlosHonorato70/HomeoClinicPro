import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, AuditActions } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { dpoName, dpoEmail, name, cnpj, phone, email, address, crm } = body;

  const clinic = await prisma.clinic.update({
    where: { id: session.user.clinicId },
    data: {
      ...(dpoName !== undefined && { dpoName }),
      ...(dpoEmail !== undefined && { dpoEmail }),
      ...(name !== undefined && { name }),
      ...(cnpj !== undefined && { cnpj }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(crm !== undefined && { crm }),
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
