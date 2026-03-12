import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY não configurada. Configure a variável de ambiente.");
  }
  return new Resend(key);
}

const FROM_EMAIL = process.env.EMAIL_FROM || "HomeoClinic Pro <noreply@homeoclinic.pro>";

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Redefinição de Senha - HomeoClinic Pro",
    html: `
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
    `,
  });
}

export async function sendInviteEmail(
  email: string,
  clinicName: string,
  inviterName: string,
  token: string,
  role: string
) {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Convite para ${clinicName} - HomeoClinic Pro`,
    html: `
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
    `,
  });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Bem-vindo ao HomeoClinic Pro!",
    html: `
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
    `,
  });
}
