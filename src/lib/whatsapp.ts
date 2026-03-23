/**
 * HomeoClinic Pro — Propriedade de Carlos Honorato
 * Protegido pela Lei 9.609/1998 (Lei do Software)
 * Todos os direitos reservados. Copia e distribuicao proibidas.
 */
/**
 * WhatsApp integration via Evolution API (self-hosted).
 * Manages instances, sends messages, and handles connection status.
 *
 * Docs: https://doc.evolution-api.com
 */

const EVOLUTION_URL =
  process.env.EVOLUTION_API_URL || "http://evolution-api:8080";
const EVOLUTION_KEY =
  process.env.EVOLUTION_API_KEY || "homeoclinic-evo-key-2026";

interface EvolutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── Instance Management ────────────────────────────────────────

/**
 * Create a new Evolution instance for a clinic.
 */
export async function createInstance(
  instanceName: string
): Promise<EvolutionResult> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: "POST",
      headers: {
        apikey: EVOLUTION_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceName,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
        rejectCall: false,
        alwaysOnline: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // Instance already exists — just return success
      if (res.status === 403 || String(err?.message).includes("already")) {
        return { success: true, data: { alreadyExists: true } };
      }
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha na conexão",
    };
  }
}

/**
 * Get QR code for connecting WhatsApp.
 */
export async function getQRCode(
  instanceName: string
): Promise<EvolutionResult> {
  try {
    const res = await fetch(
      `${EVOLUTION_URL}/instance/connect/${instanceName}`,
      {
        method: "GET",
        headers: { apikey: EVOLUTION_KEY },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha na conexão",
    };
  }
}

/**
 * Get connection status of an instance.
 */
export async function getConnectionStatus(
  instanceName: string
): Promise<{ connected: boolean; state: string; error?: string }> {
  try {
    const res = await fetch(
      `${EVOLUTION_URL}/instance/connectionState/${instanceName}`,
      {
        method: "GET",
        headers: { apikey: EVOLUTION_KEY },
      }
    );

    if (!res.ok) {
      return { connected: false, state: "error", error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const state = data?.instance?.state || data?.state || "close";
    return { connected: state === "open", state };
  } catch {
    return { connected: false, state: "error", error: "Falha na conexão" };
  }
}

/**
 * Disconnect and remove an instance.
 */
export async function deleteInstance(
  instanceName: string
): Promise<EvolutionResult> {
  try {
    // First logout
    await fetch(`${EVOLUTION_URL}/instance/logout/${instanceName}`, {
      method: "DELETE",
      headers: { apikey: EVOLUTION_KEY },
    });

    // Then delete
    const res = await fetch(
      `${EVOLUTION_URL}/instance/delete/${instanceName}`,
      {
        method: "DELETE",
        headers: { apikey: EVOLUTION_KEY },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed",
    };
  }
}

// ─── Message Sending ────────────────────────────────────────────

/**
 * Send a text message via Evolution API.
 */
export async function sendWhatsAppMessage(
  instanceName: string,
  to: string,
  text: string
): Promise<WhatsAppMessageResult> {
  try {
    const res = await fetch(
      `${EVOLUTION_URL}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: EVOLUTION_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: normalizePhone(to),
          text,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[WhatsApp] Evolution API error:", err);
      return {
        success: false,
        error: err?.message || `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.messageId,
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
  instanceName: string,
  _accessToken: string, // kept for backwards compat, ignored
  patientPhone: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  clinicName: string
): Promise<WhatsAppMessageResult> {
  const text =
    `Ola ${patientName}! \n\n` +
    `Lembrete: voce tem uma consulta agendada:\n\n` +
    `Data: ${appointmentDate}\n` +
    `Horario: ${appointmentTime}\n` +
    `Clinica: ${clinicName}\n\n` +
    `Para reagendar ou cancelar, entre em contato com a clinica.\n\n` +
    `HomeoClinic Pro`;

  return sendWhatsAppMessage(instanceName, patientPhone, text);
}

/**
 * Send appointment confirmation via WhatsApp.
 */
export async function sendAppointmentConfirmation(
  instanceName: string,
  _accessToken: string, // kept for backwards compat, ignored
  patientPhone: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  clinicName: string
): Promise<WhatsAppMessageResult> {
  const text =
    `Ola ${patientName}!\n\n` +
    `Sua consulta foi agendada com sucesso:\n\n` +
    `Data: ${appointmentDate}\n` +
    `Horario: ${appointmentTime}\n` +
    `Clinica: ${clinicName}\n\n` +
    `Aguardamos voce!\n\n` +
    `HomeoClinic Pro`;

  return sendWhatsAppMessage(instanceName, patientPhone, text);
}

/**
 * Normalize Brazilian phone number.
 * Input: "(11) 99999-9999" or "11999999999" or "+5511999999999"
 * Output: "5511999999999"
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}
