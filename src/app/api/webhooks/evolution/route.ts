import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Evolution API webhook endpoint.
 * Receives events: connection.update, send.message, messages.upsert
 * Public endpoint (no session auth) — validated by API key.
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("apikey") || req.headers.get("x-api-key");
    const expectedKey = process.env.EVOLUTION_API_KEY;

    if (!expectedKey) {
      console.error("[Evolution Webhook] EVOLUTION_API_KEY not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid key" }, { status: 401 });
    }

    const body = await req.json();
    const event = body?.event || body?.type;

    switch (event) {
      case "connection.update": {
        const state = body?.data?.state || body?.state;
        const instance = body?.instance || body?.data?.instance;
        console.log(
          `[Evolution] Connection update: ${instance} -> ${state}`
        );
        break;
      }

      case "send.message":
      case "messages.upsert": {
        // Update delivery status for sent reminders
        const messageId =
          body?.data?.key?.id || body?.key?.id || body?.messageId;
        const status = body?.data?.status || body?.status;

        if (messageId && status) {
          const newStatus =
            status === "DELIVERY_ACK" || status === "READ"
              ? "delivered"
              : status === "ERROR" || status === "FAILED"
                ? "failed"
                : "sent";

          await prisma.sentReminder
            .updateMany({
              where: { id: messageId },
              data: { status: newStatus },
            })
            .catch(() => {
              // Message might not be a reminder — ignore
            });
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Evolution Webhook] Error:", error);
    return NextResponse.json({ received: true }); // Always 200 to avoid retries
  }
}
