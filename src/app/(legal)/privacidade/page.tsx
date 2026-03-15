export const metadata = {
  title: "Política de Privacidade - HomeoClinic Pro",
};

export default function PrivacidadePage() {
  return (
    <article className="prose prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-100">
      <h1>Política de Privacidade</h1>
      <p className="text-sm text-gray-500">Última atualização: 14 de março de 2026</p>

      <p>
        Esta Política de Privacidade descreve como o HomeoClinic Pro (&quot;nós&quot;, &quot;nosso&quot;)
        coleta, utiliza, armazena e protege seus dados pessoais, em conformidade com a
        Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
      </p>

      <h2>1. Controlador de Dados</h2>
      <p>
        O controlador dos dados pessoais é o HomeoClinic Pro. Para questões relacionadas
        à proteção de dados, entre em contato com nosso Encarregado de Proteção de Dados
        (DPO) pelo email <strong>dpo@homeoclinic-ia.com</strong>.
      </p>

      <h2>2. Dados Coletados</h2>
      <h3>2.1 Dados do Profissional (Usuário)</h3>
      <ul>
        <li>Nome completo, email, CRM/registro profissional</li>
        <li>Dados da clínica (nome, CNPJ, endereço, telefone)</li>
        <li>Dados de pagamento (processados pelo Stripe, não armazenamos dados de cartão)</li>
        <li>Logs de acesso e auditoria (IP, ações realizadas, timestamps)</li>
      </ul>

      <h3>2.2 Dados de Pacientes</h3>
      <ul>
        <li>Dados pessoais: nome, CPF, RG, data de nascimento, sexo, telefone, email, endereço</li>
        <li>Dados de saúde: anamnese, consultas, diagnósticos, prescrições, evolução clínica</li>
        <li>Consentimentos LGPD registrados</li>
      </ul>

      <h2>3. Base Legal para Tratamento (Art. 7º e 11º da LGPD)</h2>
      <ul>
        <li>
          <strong>Dados do profissional:</strong> execução de contrato (Art. 7º, V) e
          consentimento (Art. 7º, I).
        </li>
        <li>
          <strong>Dados de pacientes:</strong> tutela da saúde por profissionais de saúde
          (Art. 11, II, &quot;f&quot;) e cumprimento de obrigação legal (Art. 11, II, &quot;a&quot; — CFM
          Resolução 1.821/2007).
        </li>
        <li>
          <strong>Logs de auditoria:</strong> cumprimento de obrigação legal e regulatória
          (Art. 7º, II).
        </li>
      </ul>

      <h2>4. Finalidade do Tratamento</h2>
      <ul>
        <li>Prestação do serviço de prontuário eletrônico homeopático</li>
        <li>Gestão de agenda, financeiro e equipe da clínica</li>
        <li>Repertorização e busca no repertório homeopático</li>
        <li>Sugestões por inteligência artificial (análise de sintomas e prescrição)</li>
        <li>Comunicações transacionais (verificação de email, notificações do sistema)</li>
        <li>Cobrança e gestão de assinaturas</li>
        <li>Cumprimento de obrigações legais e regulatórias</li>
      </ul>

      <h2>5. Compartilhamento de Dados</h2>
      <p>Seus dados podem ser compartilhados com:</p>
      <ul>
        <li>
          <strong>Stripe:</strong> processamento de pagamentos (dados de cobrança).
          <a href="https://stripe.com/privacy" className="text-teal-400"> Política do Stripe</a>.
        </li>
        <li>
          <strong>Brevo:</strong> envio de emails transacionais (apenas endereço de email e nome).
        </li>
        <li>
          <strong>OpenAI:</strong> análise de sintomas por IA (dados clínicos anonimizados,
          sem identificação do paciente).
        </li>
        <li>
          <strong>Sentry:</strong> monitoramento de erros (dados técnicos, sem dados pessoais).
        </li>
        <li>
          <strong>Autoridades:</strong> quando exigido por lei ou determinação judicial.
        </li>
      </ul>
      <p>
        <strong>Não vendemos, alugamos ou comercializamos dados pessoais a terceiros.</strong>
      </p>

      <h2>6. Segurança dos Dados (Art. 46 da LGPD)</h2>
      <ul>
        <li>Criptografia AES-256-GCM para dados sensíveis em repouso</li>
        <li>HTTPS (TLS 1.3) para dados em trânsito</li>
        <li>Senhas armazenadas com hash bcrypt (12 rounds)</li>
        <li>Trilha de auditoria completa de todas as operações</li>
        <li>Controle de acesso baseado em papéis (RBAC)</li>
        <li>Backups automáticos diários com retenção de 7 dias</li>
        <li>Isolamento de dados por clínica (multi-tenancy)</li>
      </ul>

      <h2>7. Retenção de Dados</h2>
      <ul>
        <li>
          <strong>Prontuários médicos:</strong> 20 anos após o último registro, conforme
          Resolução CFM 1.821/2007 e Lei nº 13.787/2018.
        </li>
        <li>
          <strong>Dados de conta do profissional:</strong> enquanto a conta estiver ativa,
          mais 5 anos após cancelamento.
        </li>
        <li>
          <strong>Logs de auditoria:</strong> 5 anos, conforme requisitos regulatórios.
        </li>
        <li>
          <strong>Dados de pagamento:</strong> conforme política do Stripe e legislação fiscal.
        </li>
      </ul>

      <h2>8. Direitos do Titular (Art. 18 da LGPD)</h2>
      <p>Você tem direito a:</p>
      <ul>
        <li>Confirmação da existência de tratamento de dados</li>
        <li>Acesso aos dados pessoais</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
        <li>Portabilidade dos dados (exportação)</li>
        <li>Eliminação dos dados tratados com consentimento</li>
        <li>Informação sobre compartilhamento com terceiros</li>
        <li>Revogação do consentimento</li>
      </ul>
      <p>
        Para exercer seus direitos, utilize o painel LGPD dentro da plataforma ou
        entre em contato com nosso DPO pelo email <strong>dpo@homeoclinic-ia.com</strong>.
      </p>

      <h2>9. Incidentes de Segurança (Art. 48 da LGPD)</h2>
      <p>
        Em caso de incidente de segurança que possa acarretar risco ou dano relevante
        aos titulares, comunicaremos a ANPD e os titulares afetados dentro de 72 horas,
        conforme Art. 48 da LGPD.
      </p>

      <h2>10. Transferência Internacional</h2>
      <p>
        Alguns de nossos prestadores de serviço (Stripe, OpenAI, Sentry) podem processar
        dados em servidores fora do Brasil. Essas transferências são realizadas com base
        em cláusulas contratuais adequadas, conforme Art. 33 da LGPD.
      </p>

      <h2>11. Cookies</h2>
      <p>
        Utilizamos apenas cookies essenciais para autenticação e funcionamento da plataforma.
        Não utilizamos cookies de rastreamento, analytics ou publicidade.
      </p>

      <h2>12. Alterações</h2>
      <p>
        Esta política pode ser atualizada periodicamente. Alterações significativas
        serão comunicadas por email com 30 dias de antecedência.
      </p>

      <h2>13. Contato</h2>
      <p>
        Para questões sobre esta Política de Privacidade:<br />
        Email: <strong>dpo@homeoclinic-ia.com</strong><br />
        Encarregado de Proteção de Dados (DPO): configurável no painel da clínica.
      </p>
    </article>
  );
}
