// Brevo (ex-Sendinblue) transactional email via REST API
// No SDK dependency needed — uses native fetch

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getApiKey(): string | null {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn("[email] BREVO_API_KEY não configurada — emails serão ignorados.");
    return null;
  }
  return key;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "HomeoClinic Pro <noreply@homeoclinic.pro>";

function parseFromEmail(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "HomeoClinic Pro", email: from };
}

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const apiKey = getApiKey();
  if (!apiKey) return;

  const sender = parseFromEmail(FROM_EMAIL);

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[email] Brevo error ${res.status}: ${body}`);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await sendEmail(
    email,
    "Redefinição de Senha - HomeoClinic Pro",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">HomeoClinic Pro</h2>
        <p>Olá, ${userName}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomeoClinic Pro — Sistema de Prontuário Eletrônico Homeopático</p>
      </div>
    `
  );
}

export async function sendInviteEmail(
  email: string,
  clinicName: string,
  inviterName: string,
  token: string,
  role: string
) {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;

  await sendEmail(
    email,
    `Convite para ${clinicName} - HomeoClinic Pro`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">HomeoClinic Pro</h2>
        <p>Olá!</p>
        <p><strong>${inviterName}</strong> convidou você para se juntar à clínica <strong>${clinicName}</strong> como <strong>${role === "admin" ? "Administrador" : "Médico"}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}"
             style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Aceitar Convite
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Este convite expira em 7 dias.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomeoClinic Pro — Sistema de Prontuário Eletrônico Homeopático</p>
      </div>
    `
  );
}

export async function sendWelcomeEmail(email: string, userName: string) {
  await sendEmail(
    email,
    "Bem-vindo ao HomeoClinic Pro!",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">HomeoClinic Pro</h2>
        <p>Olá, ${userName}!</p>
        <p>Sua conta foi criada com sucesso. Agora você tem acesso ao sistema completo de prontuário eletrônico homeopático.</p>
        <p>Recursos disponíveis:</p>
        <ul>
          <li>Repertório com 188.669 rubricas</li>
          <li>Motor de repertorização inteligente</li>
          <li>Prontuário eletrônico completo</li>
          <li>Conformidade LGPD e CFM</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Acessar Plataforma
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomeoClinic Pro — Sistema de Prontuário Eletrônico Homeopático</p>
      </div>
    `
  );
}
