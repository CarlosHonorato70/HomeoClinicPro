import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPatientAccess } from "@/lib/patient-auth";
import { logAudit, AuditActions } from "@/lib/audit";
import { tryDecrypt } from "@/lib/encryption";
import crypto from "crypto";

/**
 * GET: Check if patient has portal access
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const access = await prisma.patientAccess.findFirst({
    where: { patientId: id },
    select: { id: true, email: true, active: true, lastLogin: true, createdAt: true },
  });

  return NextResponse.json({ hasAccess: !!access, access });
}

/**
 * POST: Create portal access for a patient
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify patient belongs to clinic
  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: session.user.clinicId, deletedAt: null },
    select: { name: true, email: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Paciente nao encontrado" }, { status: 404 });
  }

  // Check if already has access
  const existing = await prisma.patientAccess.findFirst({
    where: { patientId: id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Paciente ja possui acesso ao portal" },
      { status: 409 }
    );
  }

  const body = await req.json();
  const email = (body.email || tryDecrypt(patient.email) || "").toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { error: "Email e obrigatorio para criar acesso ao portal" },
      { status: 400 }
    );
  }

  // Generate random password
  const password = body.password || crypto.randomBytes(4).toString("hex");

  const access = await createPatientAccess(id, email, password);

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_EDIT,
    details: `Acesso ao portal criado para paciente ${patient.name} (${email})`,
  });

  return NextResponse.json({
    success: true,
    accessId: access.id,
    email,
    temporaryPassword: password,
    message: "Acesso criado. Compartilhe as credenciais com o paciente.",
  });
}

/**
 * DELETE: Remove portal access
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.patientAccess.deleteMany({
    where: { patientId: id },
  });

  await logAudit({
    clinicId: session.user.clinicId,
    userId: session.user.id,
    action: AuditActions.PATIENT_EDIT,
    details: `Acesso ao portal removido para paciente ID ${id}`,
  });

  return NextResponse.json({ success: true });
}
