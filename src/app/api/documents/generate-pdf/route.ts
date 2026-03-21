import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePDF, type DocumentType } from "@/lib/pdf-generator";
import { tryDecrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { documentId, type, data } = body;

  if (!type) {
    return NextResponse.json({ error: "Document type is required" }, { status: 400 });
  }

  // If documentId provided, fetch existing document data
  let documentData = data;

  if (documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, clinicId: session.user.clinicId },
      include: {
        patient: { select: { name: true, birthDate: true } },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get clinic info
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
      select: { name: true, address: true, phone: true, cnpj: true },
    });

    // Get doctor info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, crm: true },
    });

    documentData = {
      ...JSON.parse(doc.content || "{}"),
      clinicName: clinic?.name || "",
      clinicAddress: tryDecrypt(clinic?.address) || "",
      clinicPhone: tryDecrypt(clinic?.phone) || "",
      doctorName: user?.name || "",
      doctorCrm: user?.crm || "",
      patientName: doc.patient.name,
      date: new Date().toLocaleDateString("pt-BR"),
    };
  }

  try {
    const pdfBuffer = await generatePDF(type as DocumentType, documentData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    console.error("[PDF] Generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
