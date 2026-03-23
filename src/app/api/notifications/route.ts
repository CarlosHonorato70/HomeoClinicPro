import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
} from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.user.clinicId, session.user.id, {
        limit,
        unreadOnly,
      }),
      getUnreadCount(session.user.clinicId, session.user.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();

    if (body.action === "mark_all_read") {
      await markAllAsRead(session.user.clinicId, session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
