import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import {
  createInstance,
  getQRCode,
  getConnectionStatus,
  deleteInstance,
} from "@/lib/whatsapp";

function instanceName(clinicId: string): string {
  return `homeoclinic-${clinicId}`;
}

/**
 * GET: Check WhatsApp connection status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    requirePermission(session, "manage_billing");

    const name = instanceName(session.user.clinicId);
    const status = await getConnectionStatus(name);

    return NextResponse.json({
      instanceName: name,
      connected: status.connected,
      state: status.state,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST: Create instance and get QR code
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    requirePermission(session, "manage_billing");

    const name = instanceName(session.user.clinicId);

    // Create instance (idempotent)
    const createResult = await createInstance(name);
    if (!createResult.success) {
      return NextResponse.json(
        { error: createResult.error || "Falha ao criar instancia" },
        { status: 500 }
      );
    }

    // Get QR code
    const qr = await getQRCode(name);
    if (!qr.success) {
      // Instance might already be connected
      const status = await getConnectionStatus(name);
      if (status.connected) {
        return NextResponse.json({
          connected: true,
          state: "open",
          message: "WhatsApp ja esta conectado",
        });
      }
      return NextResponse.json(
        { error: qr.error || "Falha ao gerar QR code" },
        { status: 500 }
      );
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const d = qr.data as any;
    return NextResponse.json({
      connected: false,
      qrcode: d?.base64 || d?.qrcode?.base64 || null,
      pairingCode: d?.pairingCode || null,
      state: "connecting",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE: Disconnect WhatsApp instance
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    requirePermission(session, "manage_billing");

    const name = instanceName(session.user.clinicId);
    const result = await deleteInstance(name);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Falha ao desconectar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "WhatsApp desconectado" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
