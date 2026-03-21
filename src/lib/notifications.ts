import { prisma } from "./prisma";

export interface CreateNotificationInput {
  clinicId: string;
  userId?: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      clinicId: input.clinicId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });
}

export async function getNotifications(
  clinicId: string,
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {}
) {
  const { limit = 20, unreadOnly = false } = options;

  return prisma.notification.findMany({
    where: {
      clinicId,
      OR: [{ userId }, { userId: null }], // user-specific + broadcast
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(clinicId: string, userId: string) {
  return prisma.notification.count({
    where: {
      clinicId,
      OR: [{ userId }, { userId: null }],
      read: false,
    },
  });
}

export async function markAsRead(notificationId: string, clinicId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, clinicId },
    data: { read: true },
  });
}

export async function markAllAsRead(clinicId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      clinicId,
      OR: [{ userId }, { userId: null }],
      read: false,
    },
    data: { read: true },
  });
}
