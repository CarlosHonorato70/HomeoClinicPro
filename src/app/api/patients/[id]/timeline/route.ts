import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";

interface TimelineEvent {
  id: string;
  type: "consultation" | "document" | "appointment" | "financial" | "anamnesis";
  date: string;
  title: string;
  summary: string;
  link?: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: patientId } = await params;

  // Verify patient belongs to clinic
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: session.user.clinicId },
    select: { id: true, name: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  // Fetch all related data in parallel
  const [consultations, documents, appointments, financials, anamnesis] =
    await Promise.all([
      prisma.consultation.findMany({
        where: { patientId },
        select: {
          id: true,
          date: true,
          complaint: true,
          diagnosis: true,
          prescription: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.document.findMany({
        where: { patientId },
        select: { id: true, type: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.appointment.findMany({
        where: { patientId },
        select: {
          id: true,
          date: true,
          time: true,
          type: true,
          status: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.financial.findMany({
        where: { patientId },
        select: {
          id: true,
          date: true,
          type: true,
          description: true,
          amount: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.anamnesis.findFirst({
        where: { patientId },
        select: { id: true, updatedAt: true },
      }),
    ]);

  const events: TimelineEvent[] = [];

  // Map consultations
  for (const c of consultations) {
    const complaint = tryDecrypt(c.complaint) || "";
    const diagnosis = tryDecrypt(c.diagnosis);
    events.push({
      id: c.id,
      type: "consultation",
      date: c.date.toISOString(),
      title: "Consulta",
      summary: diagnosis
        ? `${complaint.substring(0, 80)} → ${diagnosis.substring(0, 60)}`
        : complaint.substring(0, 120),
      link: `/patients/${patientId}`,
    });
  }

  // Map documents
  for (const d of documents) {
    const typeLabels: Record<string, string> = {
      prescription: "Receita",
      certificate: "Atestado",
      report: "Laudo",
      tcle: "TCLE",
    };
    events.push({
      id: d.id,
      type: "document",
      date: d.createdAt.toISOString(),
      title: typeLabels[d.type] || "Documento",
      summary: d.title,
      link: `/patients/${patientId}/documents/${d.id}`,
    });
  }

  // Map appointments
  for (const a of appointments) {
    const statusLabels: Record<string, string> = {
      scheduled: "Agendada",
      completed: "Realizada",
      cancelled: "Cancelada",
      no_show: "Não compareceu",
    };
    events.push({
      id: a.id,
      type: "appointment",
      date: a.date.toISOString(),
      title: `Consulta ${statusLabels[a.status] || a.status}`,
      summary: `${a.time} — ${a.type}`,
      link: "/agenda",
    });
  }

  // Map financials
  for (const f of financials) {
    events.push({
      id: f.id,
      type: "financial",
      date: f.date.toISOString(),
      title: f.type === "income" ? "Receita" : "Despesa",
      summary: `${f.description} — R$ ${f.amount.toFixed(2)}`,
      link: "/financial",
    });
  }

  // Anamnesis update
  if (anamnesis) {
    events.push({
      id: anamnesis.id,
      type: "anamnesis",
      date: anamnesis.updatedAt.toISOString(),
      title: "Anamnese Atualizada",
      summary: "Histórico homeopático atualizado",
      link: `/patients/${patientId}`,
    });
  }

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ events, patientName: patient.name });
}
