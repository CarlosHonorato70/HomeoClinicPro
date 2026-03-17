import {
  Shield,
  Lock,
  Eye,
  FileCheck,
  Database,
  UserCheck,
  Server,
  ShieldCheck,
  CheckCircle,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Seguranca e Conformidade | HomeoClinic Pro",
  description:
    "Conhea as medidas de seguranca, criptografia e conformidade com LGPD e CFM implementadas no HomeoClinic Pro.",
};

const sections = [
  {
    icon: Lock,
    title: "Criptografia AES-256-GCM",
    subtitle: "Dados em Repouso",
    items: [
      "Todos os dados sensiveis de pacientes sao criptografados com AES-256-GCM no nivel da aplicacao",
      "Campos protegidos: nome, CPF, RG, endereco, profissao, convenio, notas clinicas",
      "Consultas: queixa, anamnese, exame fisico, diagnostico, prescricao, evolucao",
      "Anamnese: todos os 8 campos (mental, geral, desejos, sono, transpiracao, termorregulacao, ginecologia, particular)",
      "Chaves derivadas com PBKDF2 (100.000 iteracoes) ou Argon2id",
      "Cada registro possui IV (vetor de inicializacao) unico",
    ],
  },
  {
    icon: Server,
    title: "HTTPS / TLS 1.3",
    subtitle: "Dados em Transito",
    items: [
      "Todas as comunicacoes entre cliente e servidor utilizam HTTPS com TLS 1.3",
      "HSTS habilitado com max-age de 63 dias e preload",
      "Headers de seguranca: X-Frame-Options DENY, X-Content-Type-Options nosniff",
      "Content Security Policy (CSP) restritiva configurada",
      "Permissions-Policy: camera e geolocalizacao bloqueados por padrao",
    ],
  },
  {
    icon: Eye,
    title: "Trilha de Auditoria Completa",
    subtitle: "Rastreabilidade Total",
    items: [
      "Todas as operacoes sao registradas: login, criacao/edicao de pacientes, consultas, exportacoes",
      "Captura automatica de IP do usuario em cada acao",
      "Logs imutaveis com timestamp preciso",
      "Acoes LGPD rastreadas: consentimento, anonimizacao, exportacao de dados",
      "Exportacao de logs em CSV para auditoria externa",
      "Protecao contra injecao de formulas em CSV (csvSafe)",
    ],
  },
  {
    icon: Shield,
    title: "LGPD (Lei 13.709/2018)",
    subtitle: "Lei Geral de Protecao de Dados",
    items: [
      "Art. 11, II, 'f' — Processamento de dados de saude por profissionais de saude",
      "Art. 18 — Direitos do titular: acesso, correcao, exclusao, portabilidade implementados",
      "Art. 41 — DPO (Encarregado) configuravel por clinica",
      "Art. 46 — Medidas de seguranca: criptografia, controle de acesso, auditoria",
      "Art. 48 — Procedimento para notificacao de incidentes em 72 horas",
      "Consentimento granular por paciente e por tipo (tratamento, processamento, compartilhamento)",
      "Soft-delete de pacientes (dados mantidos por 20 anos conforme CFM, anonimizaveis)",
      "Exportacao de dados do paciente em formato JSON para portabilidade",
    ],
  },
  {
    icon: Stethoscope,
    title: "CFM (Conselho Federal de Medicina)",
    subtitle: "Resolucao 1.821/2007",
    items: [
      "Prontuario eletronico em conformidade com Resolucao CFM 1.821/2007",
      "Resolucao CFM 1.638/2002 — Padrao de conteudo de prontuario",
      "Lei 13.787/2018 — Registros digitais com mesmo valor legal que papel",
      "Imutabilidade de registros clinicos (audit trail, sem exclusao de consultas)",
      "Retencao minima de 20 anos para prontuarios medicos",
      "Suporte a assinatura digital (ICP-Brasil ou equivalente)",
    ],
  },
  {
    icon: UserCheck,
    title: "Controle de Acesso (RBAC)",
    subtitle: "Seguranca por Papeis",
    items: [
      "Sistema de papeis: Administrador (13 permissoes) e Medico (6 permissoes)",
      "Middleware de autenticacao em todas as rotas da API",
      "Bloqueio de assinaturas canceladas/inadimplentes no nivel do middleware",
      "Verificacao de usuario desativado no login",
      "Mensagens de erro unificadas para prevenir enumeracao de usuarios",
      "Politica de senha forte: minimo 8 caracteres + maiuscula + minuscula + numero + especial",
    ],
  },
  {
    icon: Database,
    title: "Infraestrutura e Banco de Dados",
    subtitle: "Multi-tenant Seguro",
    items: [
      "PostgreSQL com isolamento por clinica (row-level security via clinicId)",
      "Prisma ORM com queries parametrizadas (prevencao de SQL injection)",
      "Rate limiting com Upstash Redis para prevencao de ataques de forca bruta",
      "Monitoramento de erros com Sentry",
      "Docker containerizado em servidor dedicado",
      "Backup automatico diario do banco de dados",
    ],
  },
  {
    icon: FileCheck,
    title: "Auditoria de Seguranca",
    subtitle: "45 Vulnerabilidades Corrigidas",
    items: [
      "2 rodadas completas de auditoria de seguranca realizadas",
      "27 vulnerabilidades encontradas e corrigidas na primeira rodada",
      "18 vulnerabilidades adicionais encontradas e corrigidas na segunda rodada",
      "100% dos dados sensiveis agora criptografados com AES-256-GCM",
      "Protecao contra XSS em templates de email (escapeHtml)",
      "Sanitizacao de wildcards ILIKE para prevencao de injection no repertorio",
      "Autenticacao em todas as rotas de API (exceto auth/invites/webhooks)",
    ],
  },
];

export default function SegurancaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-400" />
            <span className="font-bold">HomeoClinic Pro</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-400 mb-6">
            <ShieldCheck className="h-4 w-4" />
            LGPD Compliant | CFM Compliant | AES-256-GCM
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Seguranca e{" "}
            <span className="text-teal-400">Conformidade</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Detalhes completos sobre as medidas de seguranca, criptografia e
            conformidade regulatoria implementadas na plataforma HomeoClinic Pro.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-white/10 bg-[#111118] p-6 sm:p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                  <section.icon className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                  <p className="text-sm text-teal-400">{section.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Tem duvidas sobre seguranca? Entre em contato.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Comecar Gratuitamente
          </Link>
        </div>
      </main>
    </div>
  );
}
