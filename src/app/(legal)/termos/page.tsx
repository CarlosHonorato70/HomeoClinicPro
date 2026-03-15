export const metadata = {
  title: "Termos de Uso - HomeoClinic Pro",
};

export default function TermosPage() {
  return (
    <article className="prose prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-100">
      <h1>Termos de Uso</h1>
      <p className="text-sm text-gray-500">Última atualização: 14 de março de 2026</p>

      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e utilizar a plataforma HomeoClinic Pro (&quot;Plataforma&quot;), você concorda
        com estes Termos de Uso. Se você não concorda com qualquer parte destes termos,
        não utilize a Plataforma.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O HomeoClinic Pro é uma plataforma SaaS (Software as a Service) para gestão de
        clínicas homeopáticas, oferecendo prontuário eletrônico, repertório homeopático,
        motor de repertorização, agenda, financeiro e ferramentas de conformidade com a
        LGPD e CFM.
      </p>

      <h2>3. Cadastro e Conta</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras, atuais e completas no cadastro.</li>
        <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
        <li>Cada conta é pessoal e intransferível.</li>
        <li>Profissionais de saúde devem possuir registro ativo no respectivo conselho profissional.</li>
      </ul>

      <h2>4. Planos e Pagamento</h2>
      <ul>
        <li>O plano Gratuito oferece funcionalidades limitadas conforme descrito na página de preços.</li>
        <li>Planos pagos são cobrados mensalmente via cartão de crédito ou boleto bancário.</li>
        <li>O período de teste gratuito é de 14 dias, após o qual é necessário assinar um plano pago.</li>
        <li>Cancelamentos podem ser feitos a qualquer momento pelo painel de cobrança.</li>
        <li>Não há reembolso de períodos parciais já pagos.</li>
      </ul>

      <h2>5. Uso Aceitável</h2>
      <p>Você concorda em não:</p>
      <ul>
        <li>Utilizar a Plataforma para fins ilegais ou não autorizados.</li>
        <li>Compartilhar credenciais de acesso com terceiros não autorizados.</li>
        <li>Tentar acessar dados de outros usuários ou clínicas.</li>
        <li>Realizar engenharia reversa, descompilar ou desmontar a Plataforma.</li>
        <li>Sobrecarregar a infraestrutura com requisições automatizadas excessivas.</li>
      </ul>

      <h2>6. Dados e Privacidade</h2>
      <p>
        O tratamento de dados pessoais é regido pela nossa{" "}
        <a href="/privacidade" className="text-teal-400 hover:text-teal-300">
          Política de Privacidade
        </a>
        , que é parte integrante destes Termos de Uso.
      </p>

      <h2>7. Responsabilidade Profissional</h2>
      <ul>
        <li>
          A Plataforma é uma ferramenta de apoio ao profissional de saúde. Todas as
          decisões clínicas são de responsabilidade exclusiva do profissional.
        </li>
        <li>
          As sugestões geradas por inteligência artificial são meramente informativas e
          não substituem o julgamento clínico profissional.
        </li>
        <li>
          O repertório e matéria médica são referências acadêmicas e não constituem
          orientação médica direta.
        </li>
      </ul>

      <h2>8. Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo da Plataforma, incluindo software, design, textos e base de dados,
        é propriedade do HomeoClinic Pro ou de seus licenciadores, protegido pelas leis
        brasileiras de propriedade intelectual.
      </p>

      <h2>9. Disponibilidade</h2>
      <p>
        Nos empenhamos para manter a Plataforma disponível 24/7, mas não garantimos
        disponibilidade ininterrupta. Manutenções programadas serão comunicadas com
        antecedência.
      </p>

      <h2>10. Limitação de Responsabilidade</h2>
      <p>
        O HomeoClinic Pro não se responsabiliza por danos indiretos, incidentais ou
        consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma,
        nos limites permitidos pela legislação brasileira.
      </p>

      <h2>11. Modificações</h2>
      <p>
        Estes termos podem ser atualizados periodicamente. Alterações significativas
        serão comunicadas por email com 30 dias de antecedência.
      </p>

      <h2>12. Foro</h2>
      <p>
        Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer
        controvérsias decorrentes destes Termos, com renúncia a qualquer outro,
        por mais privilegiado que seja.
      </p>

      <h2>13. Contato</h2>
      <p>
        Para dúvidas sobre estes Termos de Uso, entre em contato pelo email{" "}
        <strong>contato@homeoclinic.pro</strong>.
      </p>
    </article>
  );
}
