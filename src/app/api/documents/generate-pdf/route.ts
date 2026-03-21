import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePDF, type DocumentType } from "@/lib/pdf-generator";
import { tryDecrypt } from "@/lib/encryption";

const VALID_TYPES: DocumentType[] = ["prescription", "certificate"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { documentId, type, data } = body;

    if (!type || !VALID_TYPES.includes(type as DocumentType)) {
      return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 });
    }

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

      const clinic = await prisma.clinic.findUnique({
        where: { id: session.user.clinicId },
        select: { name: true, address: true, phone: true, cnpj: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, crm: true },
      });

      let parsedContent = {};
      try { parsedContent = JSON.parse(doc.content || "{}"); } catch { /* empty */ }

      documentData = {
        ...parsedContent,
        clinicName: clinic?.name || "",
        clinicAddress: tryDecrypt(clinic?.address) || "",
        clinicPhone: tryDecrypt(clinic?.phone) || "",
        doctorName: user?.name || "",
        doctorCrm: user?.crm || "",
        patientName: doc.patient?.name || "Paciente",
        date: new Date().toLocaleDateString("pt-BR"),
      };
    }

    const sanitizedType = type.replace(/[^a-zA-Z]/g, "");
    const pdfBuffer = await generatePDF(type as DocumentType, documentData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizedType}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    console.error("[PDF] Generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
