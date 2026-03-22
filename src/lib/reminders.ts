/**
 * Appointment reminder scheduler.
 * Called periodically (every 15 minutes) via a cron endpoint.
 * Checks for upcoming appointments and sends reminders via configured channels.
 */

import { prisma } from "./prisma";
import { tryDecrypt } from "./encryption";
import { sendAppointmentReminder as sendWhatsAppReminder } from "./whatsapp";
import { sendAppointmentReminderEmail } from "./email";
import { createNotification } from "./notifications";

interface ReminderResult {
  sent: number;
  errors: number;
}

/**
 * Process pending reminders for all clinics.
 * Should be called every 15 minutes via cron.
 */
export async function processReminders(): Promise<ReminderResult> {
  let sent = 0;
  let errors = 0;

  // Get all clinics with reminder config
  const configs = await prisma.reminderConfig.findMany({
    where: {
      OR: [{ emailEnabled: true }, { whatsappEnabled: true }],
    },
  });

  for (const config of configs) {
    const reminderHours: number[] = JSON.parse(config.reminderHours || "[24,2]");
    const now = new Date();

    for (const hours of reminderHours) {
      // Find appointments happening in ~hours from now (±15 min window)
      const targetTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 15 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 15 * 60 * 1000);

      const appointments = await prisma.appointment.findMany({
        where: {
          clinicId: config.clinicId,
          date: { gte: windowStart, lte: windowEnd },
          status: "scheduled",
          patientId: { not: null },
        },
      });

      for (const appt of appointments) {
        if (!appt.patientId) continue;

        // Check if reminder already sent for this appointment/channel/hours
        const alreadySent = await prisma.sentReminder.findFirst({
          where: {
            appointmentId: appt.id,
            hoursBeforeAppt: hours,
          },
        });

        if (alreadySent) continue;

        // Get patient info
        const patient = await prisma.patient.findUnique({
          where: { id: appt.patientId },
          select: { name: true, phone: true, email: true },
        });

        if (!patient) continue;

        const clinic = await prisma.clinic.findUnique({
          where: { id: config.clinicId },
          select: { name: true, phone: true },
        });

        const patientPhone = tryDecrypt(patient.phone);
        const patientEmail = tryDecrypt(patient.email);
        const dateStr = appt.date.toLocaleDateString("pt-BR");
        const timeStr = appt.time;

        // Send email reminder
        if (config.emailEnabled && patientEmail) {
          try {
            await sendAppointmentReminderEmail(
              patientEmail,
              patient.name,
              dateStr,
              timeStr,
              clinic?.name || "HomeoClinic",
              tryDecrypt(clinic?.phone) || ""
            );
            await prisma.sentReminder.create({
              data: {
                appointmentId: appt.id,
                channel: "email",
                hoursBeforeAppt: hours,
                status: "sent",
              },
            });
            sent++;
          } catch (err) {
            console.error("[Reminders] Email failed:", err);
            errors++;
          }
        }

        // Send WhatsApp reminder via Evolution API
        if (config.whatsappEnabled && patientPhone) {
          const instance = `homeoclinic-${config.clinicId}`;
          try {
            const result = await sendWhatsAppReminder(
              instance,
              "", // accessToken not needed for Evolution API
              patientPhone,
              patient.name,
              dateStr,
              timeStr,
              clinic?.name || "HomeoClinic"
            );

            await prisma.sentReminder.create({
              data: {
                appointmentId: appt.id,
                channel: "whatsapp",
                hoursBeforeAppt: hours,
                status: result.success ? "sent" : "failed",
              },
            });

            if (result.success) sent++;
            else errors++;
          } catch (err) {
            console.error("[Reminders] WhatsApp failed:", err);
            errors++;
          }
        }

        // Create in-app notification for the clinic user
        await createNotification({
          clinicId: config.clinicId,
          userId: appt.userId,
          type: "appointment_reminder",
          title: "Lembrete de Consulta",
          body: `${patient.name} tem consulta em ${hours}h (${dateStr} às ${timeStr})`,
          link: `/agenda`,
        });
      }
    }
  }

  return { sent, errors };
}
