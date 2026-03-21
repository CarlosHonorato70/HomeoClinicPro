import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTrialExpiringEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint for sending trial expiration warnings.
 * Should be called once daily (e.g., 9 AM).
 * Sends emails to clinics whose trial expires in 3 days or 1 day.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Window: trials expiring between 0.5 and 3.5 days from now
    const minDate = new Date(now.getTime() + 0.5 * 24 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000);

    const trialingClinics = await prisma.clinic.findMany({
      where: {
        subscriptionStatus: "trialing",
        trialEndsAt: { gte: minDate, lte: maxDate },
      },
      include: {
        users: {
          where: { role: "admin" },
          select: { email: true, name: true },
          take: 1,
        },
      },
    });

    let sent = 0;
    const errors: string[] = [];

    for (const clinic of trialingClinics) {
      const admin = clinic.users[0];
      if (!admin?.email || !clinic.trialEndsAt) continue;

      const msLeft = clinic.trialEndsAt.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

      // Only send on day 3 and day 1
      if (daysLeft !== 3 && daysLeft !== 1) continue;

      try {
        await sendTrialExpiringEmail(
          admin.email,
          admin.name || "Usuário",
          daysLeft
        );
        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Clinic ${clinic.id}: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      checked: trialingClinics.length,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Trial expiring check failed:", error);
    return NextResponse.json(
      { error: "Failed to process trial expiring notifications" },
      { status: 500 }
    );
  }
}
