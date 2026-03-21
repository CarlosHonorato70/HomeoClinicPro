/**
 * Telemedicine service using Jitsi Meet.
 * Generates room URLs, validates access, manages session state.
 */

import crypto from "crypto";

const JITSI_DOMAIN = "meet.jit.si";

/**
 * Generate a unique, secure Jitsi room name for an appointment.
 */
export function generateRoomName(appointmentId: string, clinicId: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${appointmentId}-${clinicId}-${Date.now()}`)
    .digest("hex")
    .substring(0, 12);
  return `homeoclinic-${hash}`;
}

/**
 * Generate full Jitsi meeting URL.
 */
export function generateMeetingUrl(roomName: string): string {
  return `https://${JITSI_DOMAIN}/${roomName}`;
}

/**
 * Generate Jitsi iframe config for embedding.
 */
export function getJitsiConfig(roomName: string, displayName: string) {
  return {
    domain: JITSI_DOMAIN,
    roomName,
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      disableModeratorIndicator: true,
      enableClosePage: false,
      prejoinPageEnabled: false,
      disableDeepLinking: true,
    },
    interfaceConfigOverwrite: {
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      SHOW_JITSI_WATERMARK: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_REMOTE_DISPLAY_NAME: "Paciente",
      TOOLBAR_BUTTONS: [
        "microphone",
        "camera",
        "desktop",
        "chat",
        "recording",
        "fullscreen",
        "hangup",
        "settings",
        "tileview",
      ],
    },
    userInfo: {
      displayName,
    },
  };
}

/**
 * Validate that an appointment is eligible for telemedicine.
 */
export function isTelemedicineEligible(appointment: {
  type: string;
  status: string;
  date: Date;
}): { eligible: boolean; reason?: string } {
  if (appointment.type !== "teleconsulta") {
    return { eligible: false, reason: "Appointment is not a teleconsulta" };
  }

  if (appointment.status === "cancelled") {
    return { eligible: false, reason: "Appointment has been cancelled" };
  }

  // Allow access 30 minutes before to 2 hours after the scheduled time
  const now = new Date();
  const apptTime = new Date(appointment.date);
  const windowStart = new Date(apptTime.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(apptTime.getTime() + 2 * 60 * 60 * 1000);

  if (now < windowStart || now > windowEnd) {
    return {
      eligible: false,
      reason: "Telemedicine access is available 30 minutes before the appointment",
    };
  }

  return { eligible: true };
}
