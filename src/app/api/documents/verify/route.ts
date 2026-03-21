import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyDocument } from "@/lib/digital-signature";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { documentId } = body;

  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  const doc = await prisma.document.findFirst({
    where: { id: documentId, clinicId: session.user.clinicId },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const result = await verifyDocument(documentId, doc.content);

  return NextResponse.json({
    documentId,
    valid: result.valid,
    signatureCount: result.signatures.length,
    signatures: result.signatures,
  });
}
