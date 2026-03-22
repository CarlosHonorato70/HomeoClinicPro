"use client";

import { AdminGuard } from "@/components/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Download, Shield, Lock, Eye, Clock, UserCheck } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    icon: Shield,
    title: "1. Dados Coletados",
    content:
      "Coletamos dados pessoais (nome, CPF, RG, telefone, email, endereco) e dados de saude (consultas, anamnese, prescricoes, exames) estritamente necessarios para a prestacao de servicos de atendimento medico homeopatico.",
  },
  {
    icon: Lock,
    title: "2. Seguranca dos Dados",
    content:
      "Todos os dados pessoais e de saude sao criptografados com AES-256-GCM (padrao militar). O acesso e controlado por autenticacao, RBAC (controle de acesso baseado em funcao) e todas as operacoes sao registradas em trilha de auditoria inalteravel.",
  },
  {
    icon: FileText,
    title: "3. Base Legal",
    content:
      "O tratamento de dados de saude e realizado com base no Art. 11, II, \"f\" da LGPD (tutela da saude, em procedimento realizado por profissionais da area da saude). O consentimento granular e obtido conforme Art. 7 e Art. 8.",
  },
  {
    icon: UserCheck,
    title: "4. Direitos do Titular (Art. 18)",
    content:
      "O paciente tem direito a: confirmacao do tratamento, acesso aos dados, correcao, anonimizacao, portabilidade, eliminacao (respeitando retencao legal), informacao sobre compartilhamento, revogacao do consentimento.",
  },
  {
    icon: Eye,
    title: "5. Compartilhamento",
    content:
      "Os dados nao sao compartilhados com terceiros, exceto quando exigido por lei ou por determinacao judicial. O processamento de pagamentos e feito via Asaas com dados minimos necessarios.",
  },
  {
    icon: Clock,
    title: "6. Retencao de Dados",
    content:
      "Os prontuarios medicos sao retidos por 20 anos conforme Resolucao CFM 1.821/2007 e Lei 13.787/2018. Apos esse periodo, ou mediante solicitacao do titular, os dados sao anonimizados preservando a utilidade estatistica.",
  },
];

export default function PrivacyPolicyPage() {
  const handleDownload = () => {
    const text = sections
      .map((s) => `${s.title}\n${s.content}`)
      .join("\n\n");
    const header =
      "POLITICA DE PRIVACIDADE - HOMEOCLINIC PRO\n" +
      "Em conformidade com a Lei Geral de Protecao de Dados (Lei 13.709/2018)\n\n";
    const footer =
      "\n\nDPO (Encarregado de Dados): Configurado nas configuracoes da clinica.\n" +
      "Para exercer seus direitos, entre em contato com o DPO da clinica.\n\n" +
      "Ultima atualizacao: " + new Date().toLocaleDateString("pt-BR");

    const blob = new Blob([header + text + footer], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "politica-privacidade-homeoclinic.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/lgpd">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-teal-400" />
                Politica de Privacidade
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Lei 13.709/2018 (LGPD) | Resolucao CFM 1.821/2007
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Baixar
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.title} className="bg-[#111118] border-[#1e1e2e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-teal-400 flex items-center gap-2">
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-[#111118] border-teal-500/30">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 text-center">
              Esta politica e aplicada automaticamente a todos os pacientes cadastrados na plataforma.
              O DPO (Encarregado de Dados) pode ser configurado em Configuracoes da Clinica.
              Ultima atualizacao: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
