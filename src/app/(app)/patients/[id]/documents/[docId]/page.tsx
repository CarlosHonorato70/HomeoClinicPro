"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DocumentData {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  patient: {
    name: string;
    cpf: string | null;
  };
}

interface ClinicData {
  name: string;
  address: string;
  phone: string;
  email: string;
  crm: string;
}

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const typeLabels: Record<string, string> = {
  tcle: "TCLE",
  prescription: "Receituário",
  certificate: "Atestado",
  report: "Relatório",
};

const typeBadgeClass: Record<string, string> = {
  tcle: "bg-blue-600",
  prescription: "bg-teal-600",
  certificate: "bg-yellow-600",
  report: "bg-purple-600",
};

export default function DocumentViewPage() {
  const { id: patientId, docId } = useParams<{
    id: string;
    docId: string;
  }>();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/documents/${docId}`).then((r) => r.json()),
      fetch("/api/settings/dpo").then((r) => r.json()),
    ]).then(([docData, clinicData]) => {
      setDocument(docData);
      setClinic(clinicData);
      setLoading(false);
    });
  }, [docId]);

  if (loading) return <div className="text-gray-500">Carregando...</div>;
  if (!document)
    return <div className="text-gray-500">Documento não encontrado</div>;

  let parsedContent: Record<string, unknown> = {};
  try {
    parsedContent = JSON.parse(document.content);
  } catch {
    parsedContent = { raw: document.content };
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 40px !important;
            margin: 0 !important;
          }
          .print-area * {
            color: black !important;
            border-color: #ccc !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <Link href={`/patients/${patientId}/documents`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-teal-400" />
              Visualizar Documento
            </h1>
          </div>
          <Button
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Card className="bg-[#111118] border-[#1e1e2e] print-area">
          <CardContent className="p-8 space-y-8">
            {/* Clinic Header */}
            {clinic && (
              <div className="text-center border-b border-[#2a2a3a] pb-6">
                <h2 className="text-xl font-bold">
                  {clinic.name || "Clínica Homeopática"}
                </h2>
                {clinic.address && (
                  <p className="text-sm text-gray-400 mt-1">{clinic.address}</p>
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mt-1">
                  {clinic.phone && <span>Tel: {clinic.phone}</span>}
                  {clinic.email && <span>{clinic.email}</span>}
                </div>
                {clinic.crm && (
                  <p className="text-sm text-gray-400 mt-1">
                    CRM: {clinic.crm}
                  </p>
                )}
              </div>
            )}

            {/* Document Title */}
            <div className="text-center space-y-2">
              <Badge className={typeBadgeClass[document.type] || "bg-gray-600"}>
                {typeLabels[document.type] || document.type}
              </Badge>
              <h3 className="text-lg font-bold">{document.title}</h3>
              <p className="text-sm text-gray-400">
                Paciente: {document.patient.name}
                {document.patient.cpf && ` — CPF: ${document.patient.cpf}`}
              </p>
            </div>

            {/* Content based on type */}
            <div className="space-y-4">
              {document.type === "tcle" && (
                <TcleContent content={parsedContent} />
              )}
              {document.type === "prescription" && (
                <PrescriptionContent content={parsedContent} />
              )}
              {document.type === "certificate" && (
                <CertificateContent content={parsedContent} />
              )}
              {document.type === "report" && (
                <ReportContent content={parsedContent} />
              )}
            </div>

            {/* Signature area */}
            <div className="pt-12 space-y-6">
              <div className="text-center text-sm text-gray-400">
                {formatDate(document.createdAt)}
              </div>
              <div className="flex justify-center">
                <div className="text-center space-y-2 w-64">
                  <div className="border-t border-gray-500 pt-2">
                    <p className="text-sm font-medium">
                      {clinic?.name || "Médico Responsável"}
                    </p>
                    {clinic?.crm && (
                      <p className="text-xs text-gray-400">
                        CRM: {clinic.crm}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TcleContent({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="space-y-4 text-sm">
      {content.procedureDescription ? (
        <Section
          title="Descrição do Procedimento"
          text={content.procedureDescription as string}
        />
      ) : null}
      {content.risks ? (
        <Section title="Riscos" text={content.risks as string} />
      ) : null}
      {content.benefits ? (
        <Section title="Benefícios" text={content.benefits as string} />
      ) : null}
      {content.alternatives ? (
        <Section title="Alternativas" text={content.alternatives as string} />
      ) : null}
      <div className="mt-6 pt-4 border-t border-[#2a2a3a]">
        <p className="text-xs text-gray-400">
          Declaro que fui informado(a) sobre os procedimentos acima descritos,
          seus riscos, benefícios e alternativas, e consinto livremente com sua
          realização.
        </p>
      </div>
      <div className="flex justify-between pt-8">
        <div className="text-center w-48">
          <div className="border-t border-gray-500 pt-2">
            <p className="text-xs text-gray-400">Paciente / Responsável</p>
          </div>
        </div>
        <div className="text-center w-48">
          <div className="border-t border-gray-500 pt-2">
            <p className="text-xs text-gray-400">Testemunha</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrescriptionContent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const items = (content.items as PrescriptionItem[]) || [];
  const notes = (content.notes as string) || "";

  return (
    <div className="space-y-4">
      <div className="text-center text-lg font-semibold mb-4">Rx</div>
      {items.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a3a]">
              <th className="text-left py-2 px-2">Medicamento</th>
              <th className="text-left py-2 px-2">Dosagem</th>
              <th className="text-left py-2 px-2">Frequência</th>
              <th className="text-left py-2 px-2">Duração</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-[#1e1e2e]">
                <td className="py-2 px-2 font-medium">{item.medication}</td>
                <td className="py-2 px-2">{item.dosage}</td>
                <td className="py-2 px-2">{item.frequency}</td>
                <td className="py-2 px-2">{item.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {notes ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 mb-1">
            Observações:
          </p>
          <p className="text-sm whitespace-pre-wrap">{notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function CertificateContent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const days = content.days as number;
  const startDate = content.startDate as string;
  const cid = content.cid as string;
  const notes = content.notes as string;

  return (
    <div className="space-y-4 text-sm">
      <p className="leading-relaxed">
        Atesto para os devidos fins que o(a) paciente acima identificado(a)
        encontra-se sob cuidados médicos
        {days
          ? `, necessitando de afastamento de suas atividades por ${days} (${numberToWords(days)}) dia${days > 1 ? "s" : ""}`
          : ""}
        {startDate ? `, a partir de ${formatDate(startDate)}` : ""}.
      </p>
      {cid ? (
        <p>
          <span className="font-semibold">CID:</span> {cid}
        </p>
      ) : null}
      {notes ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 mb-1">
            Observações:
          </p>
          <p className="whitespace-pre-wrap">{notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function ReportContent({ content }: { content: Record<string, unknown> }) {
  const period = content.period as string;
  const reportText = content.content as string;

  return (
    <div className="space-y-4 text-sm">
      {period ? (
        <p>
          <span className="font-semibold">Período:</span> {period}
        </p>
      ) : null}
      {reportText ? (
        <p className="whitespace-pre-wrap leading-relaxed">{reportText}</p>
      ) : null}
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="font-semibold text-teal-400 mb-1">{title}</p>
      <p className="whitespace-pre-wrap text-gray-300">{text}</p>
    </div>
  );
}

function numberToWords(n: number): string {
  const units = [
    "",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
  ];
  const teens = [
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];
  const tens = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];

  if (n < 1 || n > 99) return String(n);
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? tens[t] : `${tens[t]} e ${units[u]}`;
}
