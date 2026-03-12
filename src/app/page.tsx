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
    title: "Repertorização Avançada",
    description:
      "4 métodos: Soma de Graus, Cobertura, Kent e Boenninghausen. Grid visual interativo com ranking.",
  },
  {
    icon: Pill,
    title: "Matéria Médica",
    description:
      "1.942 textos de matéria médica com seções organizadas por remédio e navegação intuitiva.",
  },
  {
    icon: FileText,
    title: "Prontuário Eletrônico",
    description:
      "Consultas, anamnese homeopática completa, prescrições e documentos clínicos padronizados.",
  },
  {
    icon: Shield,
    title: "Conformidade LGPD",
    description:
      "Criptografia AES-256, trilha de auditoria, consentimento granular e direitos do titular de dados.",
  },
  {
    icon: LayoutDashboard,
    title: "Gestão Completa",
    description:
      "Agenda, financeiro, equipe multi-usuário e assinatura com planos flexíveis para sua clínica.",
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
      "1 usuário",
      "20 consultas/mês",
      "Repertório completo",
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
      "3 usuários",
      "Consultas ilimitadas",
      "Repertorização avançada",
      "Matéria médica completa",
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
      "Usuários ilimitados",
      "Consultas ilimitadas",
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
              <span>LGPD Compliant</span>
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
              188.669 rubricas, 3.943 remédios, matéria médica completa.
              Repertorização avançada com 4 métodos. Tudo em conformidade com a
              LGPD.
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
                { value: "55", label: "Capítulos" },
                { value: "1.942", label: "Textos de MM" },
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
                Ferramentas profissionais para homeopatia, integradas e
                otimizadas para o seu dia a dia clínico.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

            <div className="grid gap-6 sm:grid-cols-3">
              {compliance.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-[#111118] p-6 text-center"
                >
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10">
                    <item.icon className="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mb-3 text-sm font-medium text-teal-400">
                    {item.subtitle}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para modernizar sua prática homeopática?
            </h2>
            <p className="mb-8 text-lg text-gray-400">
              Junte-se a homeopatas que já utilizam a plataforma mais completa do
              Brasil. Comece gratuitamente, sem cartão de crédito.
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
            <p className="mt-2 text-xs text-gray-600">
              Dados de repertório baseados no SIHORE MAX 7.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
