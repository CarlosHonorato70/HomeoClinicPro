"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, EyeOff, FileText, Info } from "lucide-react";

const lgpdCards = [
  {
    title: "Gestão de Consentimentos",
    description:
      "Gerencie os consentimentos dos pacientes de forma granular, incluindo tratamento médico, armazenamento de dados e comunicações.",
    icon: Shield,
    href: "/lgpd/consents",
  },
  {
    title: "Exportação de Dados",
    description:
      "Exporte os dados dos pacientes em formato portável conforme o Art. 18 da LGPD (direito à portabilidade dos dados).",
    icon: Download,
    href: "/lgpd/export",
  },
  {
    title: "Anonimização",
    description:
      "Anonimize ou pseudonimize dados de pacientes para uso em pesquisas ou relatórios estatísticos sem identificação pessoal.",
    icon: EyeOff,
    href: "/lgpd/anonymize",
  },
  {
    title: "Política de Privacidade",
    description:
      "Visualize e gerencie a política de privacidade da clínica, termos de uso e avisos de proteção de dados exibidos aos pacientes.",
    icon: FileText,
    href: "#",
  },
];

export default function LGPDPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conformidade LGPD</h1>
        <p className="text-gray-400 mt-1">
          Gerencie a conformidade com a Lei Geral de Proteção de Dados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lgpdCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="bg-[#111118] border-white/10 hover:border-teal-500/40 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <card.icon className="h-5 w-5 text-teal-400" />
                  </div>
                  <CardTitle className="text-gray-200">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-[#111118] border-teal-500/30">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-gray-200 font-medium">
              Status de Conformidade LGPD
            </p>
            <p className="text-sm text-gray-400">
              Esta plataforma implementa criptografia AES-256-GCM para dados em
              repouso, trilha de auditoria completa, gestão granular de
              consentimentos e mecanismos de portabilidade conforme exigido pela
              Lei n.o 13.709/2018. Os prontuários médicos são retidos por 20 anos
              em conformidade com a Resolução CFM 1.821/2007.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
