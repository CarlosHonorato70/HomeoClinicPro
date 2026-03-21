import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signDocument } from "@/lib/digital-signature";
import { logAudit, AuditActions } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { documentId } = body;

    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ error: "documentId é obrigatório" }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, clinicId: session.user.clinicId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, crm: true },
    });

    const signature = await signDocument({
      documentId,
      signerId: session.user.id,
      signerName: user?.name || session.user.name || "",
      signerCrm: user?.crm || undefined,
      content: doc.content,
    });

    await logAudit({
      clinicId: session.user.clinicId,
      userId: session.user.id,
      action: AuditActions.DOCUMENT_CREATE,
      details: `Documento ${documentId} assinado digitalmente`,
    });

    return NextResponse.json({
      success: true,
      signature: {
        id: signature.id,
        hash: signature.hash,
        signedAt: signature.signedAt,
        signerName: signature.signerName,
        signerCrm: signature.signerCrm,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro ao assinar documento";
    console.error("[Sign] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
