import { Prisma } from "@prisma/client";
import { prisma } from "../../libs/prisma";
import { getIO } from "../../libs/socket";
import { NotFoundError } from "../../utils/error.response";
import {
  NotificationListQuery,
  NotificationRoleFilterQuery,
  SendNotificationInput,
} from "../../validations/notification.schema";

const notificationSelect = {
  id: true,
  account_id: true,
  message: true,
  is_read: true,
  type: true,
  target_role: true,
  link_to: true,
  created_at: true,
} satisfies Prisma.NotificationSelect;

const buildNotificationWhere = (
  accountId: string,
  query: NotificationListQuery,
): Prisma.NotificationWhereInput => {
  const where: Prisma.NotificationWhereInput = { account_id: accountId };

  if (query.type) {
    where.type = query.type;
  }

  if (query.target_role) {
    where.target_role = query.target_role;
  }

  if (query.is_read !== undefined) {
    where.is_read = query.is_read;
  }

  return where;
};

export const sendNotification = async (
  accountId: string,
  payload: SendNotificationInput,
) => {
  const notification = await prisma.notification.create({
    data: {
      account_id: accountId,
      message: payload.message,
      type: payload.type,
      target_role: payload.target_role,
      link_to: payload.link_to,
      is_read: false,
    },
    select: notificationSelect,
  });

  try {
    const io = getIO();
    io.to(accountId).emit("new_notification", notification);
  } catch (error) {
    console.error("Socket emit failed:", error);
  }

  return notification;
};

export const getNotifications = async (
  accountId: string,
  query: NotificationListQuery,
) => {
  const where = buildNotificationWhere(accountId, query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const [notifications, totalItems] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: notificationSelect,
    }),
    prisma.notification.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
    },
  };
};

export const getUnreadNotificationCount = async (
  accountId: string,
  filter: NotificationRoleFilterQuery,
) => {
  const where: Prisma.NotificationWhereInput = {
    account_id: accountId,
    is_read: false,
  };

  if (filter.target_role) {
    where.target_role = filter.target_role;
  }

  const unread_count = await prisma.notification.count({
    where,
  });

  return { unread_count };
};

export const markNotificationAsRead = async (
  accountId: string,
  notificationId: string,
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      account_id: accountId,
    },
    select: {
      id: true,
      is_read: true,
    },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  if (notification.is_read) {
    return { id: notificationId, is_read: true };
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
    select: {
      id: true,
      is_read: true,
    },
  });

  return updated;
};

export const markAllNotificationsAsRead = async (
  accountId: string,
  filter: NotificationRoleFilterQuery,
) => {
  const where: Prisma.NotificationWhereInput = {
    account_id: accountId,
    is_read: false,
  };

  if (filter.target_role) {
    where.target_role = filter.target_role;
  }

  const { count } = await prisma.notification.updateMany({
    where,
    data: {
      is_read: true,
    },
  });

  return { updated_count: count };
};

