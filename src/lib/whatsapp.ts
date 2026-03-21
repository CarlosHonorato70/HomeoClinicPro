/**
 * WhatsApp Business API (Cloud API) integration.
 * Uses the official Meta Graph API for sending messages.
 *
 * Requires:
 * - WHATSAPP_ACCESS_TOKEN (permanent system user token)
 * - WhatsApp phone number ID (stored per clinic in ReminderConfig)
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a text message via WhatsApp Business API.
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<WhatsAppMessageResult> {
  try {
    const response = await fetch(
      `${GRAPH_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalizePhone(to),
          type: "text",
          text: { preview_url: false, body: text },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("[WhatsApp] API error:", err);
      return {
        success: false,
        error: err?.error?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[WhatsApp] Send failed:", message);
    return { success: false, error: message };
  }
}

/**
 * Send an appointment reminder via WhatsApp.
 */
export async function sendAppointmentReminder(
  phoneNumberId: string,
  accessToken: string,
  patientPhone: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  clinicName: string
): Promise<WhatsAppMessageResult> {
  const text =
    `Olá ${patientName}! 👋\n\n` +
    `Lembrete: você tem uma consulta agendada:\n\n` +
    `📅 Data: ${appointmentDate}\n` +
    `🕐 Horário: ${appointmentTime}\n` +
    `🏥 Clínica: ${clinicName}\n\n` +
    `Para reagendar ou cancelar, entre em contato com a clínica.\n\n` +
    `HomeoClinic Pro`;

  return sendWhatsAppMessage(phoneNumberId, accessToken, patientPhone, text);
}

/**
 * Send appointment confirmation via WhatsApp.
 */
export async function sendAppointmentConfirmation(
  phoneNumberId: string,
  accessToken: string,
  patientPhone: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  clinicName: string
): Promise<WhatsAppMessageResult> {
  const text =
    `Olá ${patientName}! ✅\n\n` +
    `Sua consulta foi agendada com sucesso:\n\n` +
    `📅 Data: ${appointmentDate}\n` +
    `🕐 Horário: ${appointmentTime}\n` +
    `🏥 Clínica: ${clinicName}\n\n` +
    `Aguardamos você!\n\n` +
    `HomeoClinic Pro`;

  return sendWhatsAppMessage(phoneNumberId, accessToken, patientPhone, text);
}

/**
 * Normalize Brazilian phone number to WhatsApp format.
 * Input: "(11) 99999-9999" or "11999999999" or "+5511999999999"
 * Output: "5511999999999"
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}
