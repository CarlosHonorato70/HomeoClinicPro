import Link from "next/link";
import {
  Stethoscope,
  BookOpen,
  FlaskConical,
  Pill,
  FileText,
  Shield,
  LayoutDashboard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Star,
  ShieldCheck,
  Eye,
  Clock,
  Database,
  Fingerprint,
  ServerCog,
  Mic,
  Sparkles,
  Video,
  Smartphone,
  BarChart3,
  Upload,
  Leaf,
  BookMarked,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Repertório Homeopático",
    description:
      "188.669 rubricas em 55 capítulos. O maior repertório em português do mundo com busca instantânea.",
  },
  {
    icon: FlaskConical,
    title: "6 Métodos de Repertorização",
    description:
      "Soma de Graus, Cobertura, Kent, Boenninghausen, Hahnemann e Algorítmico. Grid visual interativo com ranking.",
  },
  {
    icon: Pill,
    title: "Matéria Médica Completa",
    description:
      "3.327 textos de matéria médica com busca semântica, filtragem por fonte e navegação intuitiva.",
  },
  {
    icon: FileText,
    title: "Prontuário Eletrônico",
    description:
      "Consultas, anamnese com 5 templates especializados (homeopatia, pediatria, dermatologia, ginecologia, psiquiatria), prescrições e documentos.",
  },
  {
    icon: Mic,
    title: "Transcrição por IA",
    description:
      "Grave a consulta por voz e a IA transcreve automaticamente. Funciona na anamnese e na consulta.",
  },
  {
    icon: Sparkles,
    title: "Assistente de IA",
    description:
      "Análise inteligente de sintomas em 4 etapas: identificação, seleção de rubricas, repertorização e prescrição assistida.",
  },
  {
    icon: Video,
    title: "Telemedicina Integrada",
    description:
      "Videochamada embutida via Jitsi Meet com prontuário lado a lado. CFM Resolução 2.314/2022.",
  },
  {
    icon: BookMarked,
    title: "Casos Clínicos",
    description:
      "Banco de casos com análise de padrões por IA. Registre desfechos e a IA aprende com os resultados.",
  },
  {
    icon: Shield,
    title: "Conformidade LGPD + CFM",
    description:
      "Criptografia AES-256-GCM, trilha de auditoria completa, consentimento granular e retenção de 20 anos.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Analítico",
    description:
      "Gráficos de consultas/mês, novos pacientes, taxa de retorno e agenda do dia. Visão completa da prática.",
  },
  {
    icon: Leaf,
    title: "Fitoterapia",
    description:
      "310 plantas medicinais com nome científico, indicações, posologia e 243 termos no dicionário médico.",
  },
  {
    icon: Smartphone,
    title: "App Mobile (PWA)",
    description:
      "Instale no celular como aplicativo. Acesso rápido ao repertório, agenda e pacientes em qualquer lugar.",
  },
];

const plans = [
  {
    name: "Gratuito",
    price: "0",
    period: "/mês",
    description: "Para conhecer a plataforma",
    features: [
      "10 pacientes",
      "1 profissional (médico ou equipe)",
      "20 consultas/mês",
      "Repertório completo (188K rubricas)",
      "Agenda diária, semanal e mensal",
      "Suporte por e-mail",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Profissional",
    price: "149",
    period: "/mês",
    description: "Para consultórios em crescimento",
    features: [
      "500 pacientes",
      "3 profissionais (médicos + equipe)",
      "Consultas ilimitadas",
      "6 métodos de repertorização",
      "Transcrição por IA (voz para texto)",
      "Assistente de IA com prescrição",
      "Telemedicina integrada",
      "5 templates de anamnese",
      "Casos clínicos + fitoterapia",
      "Importação CSV de pacientes",
      "Suporte prioritário",
    ],
    cta: "Assinar Agora",
    highlighted: true,
    badge: "Mais Popular",
  },
  {
    name: "Enterprise",
    price: "349",
    period: "/mês",
    description: "Para clínicas e redes",
    features: [
      "Pacientes ilimitados",
      "Até 12 profissionais (extra: R$39/mês cada)",
      "Consultas ilimitadas",
      "Todas as funcionalidades Pro",
      "Dashboard analítico avançado",
      "API de integração",
      "Multi-clínica",
      "Suporte dedicado 24/7",
    ],
    cta: "Fale Conosco",
    highlighted: false,
  },
];

const compliance = [
  {
    icon: Shield,
    title: "LGPD",
    subtitle: "Lei 13.709/2018",
    description:
      "Tratamento de dados de saúde em total conformidade com a Lei Geral de Proteção de Dados.",
  },
  {
    icon: Stethoscope,
    title: "CFM",
    subtitle: "Resolução 1.821/2007",
    description:
      "Prontuário eletrônico em conformidade com as normas do Conselho Federal de Medicina.",
  },
  {
    icon: Lock,
    title: "AES-256-GCM",
    subtitle: "Criptografia de ponta",
    description:
      "Dados sensíveis criptografados em repouso e em trânsito com padrão militar de segurança.",
  },
];

const securityChecklist = [
  { icon: Lock, text: "Criptografia AES-256-GCM em repouso" },
  { icon: ShieldCheck, text: "HTTPS/TLS 1.3 em trânsito" },
  { icon: Eye, text: "Trilha de auditoria com IP" },
  { icon: Fingerprint, text: "Consentimento LGPD granular" },
  { icon: Clock, text: "Retenção de 20 anos (CFM)" },
  { icon: Database, text: "Backup automático diário" },
  { icon: ServerCog, text: "48 vulnerabilidades auditadas e corrigidas" },
  { icon: Shield, text: "100% dos dados sensíveis criptografados" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              HomeoClinic <span className="text-teal-400">Pro</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
            >
              Começar Grátis
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
          {/* Background gradient decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-teal-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-sm text-teal-400">
              <Shield className="h-4 w-4" />
              <span>Compativel com LGPD</span>
              <span className="text-teal-600">|</span>
              <span>CFM</span>
              <span className="text-teal-600">|</span>
              <span>AES-256</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              O Prontuário Eletrônico mais completo para{" "}
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Homeopatia
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
              188.669 rubricas, 3.943 remédios, 3.327 textos de matéria médica,
              310 plantas medicinais. 6 métodos de repertorização, IA com
              transcrição por voz, telemedicina integrada e muito mais.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-500 hover:shadow-teal-500/30"
              >
                Começar Gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-gray-300 transition-all hover:border-white/20 hover:text-white"
              >
                Ver Demonstração
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { value: "188.669", label: "Rubricas" },
                { value: "3.943", label: "Remédios" },
                { value: "3.327", label: "Textos de MM" },
                { value: "310", label: "Plantas Medicinais" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-teal-400 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="funcionalidades"
          className="border-t border-white/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Tudo que você precisa em uma{" "}
                <span className="text-teal-400">única plataforma</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-400">
                A plataforma clínica de homeopatia mais completa do Brasil.
                IA, telemedicina, repertorização avançada e muito mais.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-white/10 bg-[#111118] p-6 transition-colors hover:border-teal-500/30"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/10">
                    <feature.icon className="h-5 w-5 text-teal-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="precos"
          className="border-t border-white/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Planos para cada{" "}
                <span className="text-teal-400">momento</span> da sua clínica
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-400">
                Comece gratuitamente e escale conforme sua prática cresce. Sem
                surpresas, sem taxas ocultas.
              </p>
            </div>

            <div className="grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border p-8 ${
                    plan.highlighted
                      ? "border-teal-500 bg-[#111118] ring-1 ring-teal-500/50 lg:scale-105"
                      : "border-white/10 bg-[#111118]"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white">
                        <Star className="h-3 w-3" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <h3 className="mb-1 text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-gray-400">R$</span>
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-sm text-gray-400">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-gray-300"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-teal-600 text-white hover:bg-teal-500"
                        : "border border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / Compliance */}
        <section className="border-t border-white/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Segurança e{" "}
                <span className="text-teal-400">Conformidade</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-400">
                Seus dados e os de seus pacientes protegidos com os mais altos
                padrões de segurança e em conformidade com a legislação
                brasileira.
              </p>
            </div>

            {/* Certification Badges */}
            <div className="grid gap-6 sm:grid-cols-3 mb-12">
              {compliance.map((item) => (
                <div
                  key={item.title}
                  className="relative rounded-xl border border-teal-500/20 bg-gradient-to-b from-teal-500/5 to-transparent p-6 text-center"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-teal-600/30">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      CERTIFICADO
                    </span>
                  </div>
                  <div className="mx-auto mt-2 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/10 ring-2 ring-teal-500/20">
                    <item.icon className="h-7 w-7 text-teal-400" />
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mb-3 text-sm font-semibold text-teal-400">
                    {item.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Security Checklist */}
            <div className="rounded-xl border border-white/10 bg-[#111118] p-8">
              <h3 className="mb-6 text-center text-xl font-bold text-white">
                Medidas de Segurança Implementadas
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {securityChecklist.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-teal-400" />
                    <span className="text-sm text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/seguranca"
                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-semibold transition-colors"
              >
                Ver detalhes completos de seguranca e conformidade →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para transformar sua prática homeopática?
            </h2>
            <p className="mb-8 text-lg text-gray-400">
              A plataforma clínica de homeopatia mais completa do Brasil.
              Repertório, IA, telemedicina, prontuário e muito mais.
              Comece gratuitamente, sem cartão de crédito.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-500 hover:shadow-teal-500/30"
            >
              Criar Conta Gratuita
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                HomeoClinic <span className="text-teal-400">Pro</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link
                href="/termos"
                className="transition-colors hover:text-gray-300"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacidade"
                className="transition-colors hover:text-gray-300"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/contato"
                className="transition-colors hover:text-gray-300"
              >
                Contato
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; 2026 HomeoClinic Pro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
