import { notificationService } from "@/services/notification.service";
import type {
  NotificationItem,
  NotificationPagination,
  NotificationTargetRole,
} from "@/types";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { create } from "zustand";

type NotificationState = {
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: NotificationPagination | null;
  isLoading: boolean;
  socket: Socket | null;
  activeRole: NotificationTargetRole | null;
  connectSocket: (targetRole: NotificationTargetRole) => void;
  disconnectSocket: () => void;
  hydrateForRole: (targetRole: NotificationTargetRole) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (targetRole: NotificationTargetRole) => Promise<void>;
};

const DEFAULT_PAGINATION: NotificationPagination = {
  page: 1,
  limit: 20,
  total_items: 0,
  total_pages: 1,
};

const resolveSocketUrl = () => {
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (envSocketUrl) return envSocketUrl;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
};

const prependIfMissing = (
  items: NotificationItem[],
  incoming: NotificationItem,
): NotificationItem[] => {
  if (items.some((item) => item.id === incoming.id)) return items;
  return [incoming, ...items];
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: null,
  isLoading: false,
  socket: null,
  activeRole: null,

  connectSocket: (targetRole) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const state = get();
    if (state.socket?.connected && state.activeRole === targetRole) {
      return;
    }

    state.socket?.disconnect();

    const socket = io(resolveSocketUrl(), {
      auth: { token },
    });

    socket.on("new_notification", (notif: NotificationItem) => {
      if (notif.target_role !== get().activeRole) return;

      set((prev) => ({
        notifications: prependIfMissing(prev.notifications, notif),
        unreadCount: notif.is_read ? prev.unreadCount : prev.unreadCount + 1,
      }));

      toast.info(notif.message);
    });

    set({ socket, activeRole: targetRole });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, activeRole: null });
  },

  hydrateForRole: async (targetRole) => {
    set({ isLoading: true });
    try {
      const [listResponse, unreadResponse] = await Promise.all([
        notificationService.getNotifications({
          page: 1,
          limit: 20,
          target_role: targetRole,
        }),
        notificationService.getUnreadCount({
          target_role: targetRole,
        }),
      ]);

      set({
        notifications: listResponse.data.notifications,
        pagination: listResponse.data.pagination ?? DEFAULT_PAGINATION,
        unreadCount: unreadResponse.data.unread_count,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const state = get();
    const target = state.notifications.find((item) => item.id === id);
    if (!target || target.is_read) return;

    await notificationService.markAsRead(id);
    set((prev) => ({
      notifications: prev.notifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
      unreadCount: Math.max(prev.unreadCount - 1, 0),
    }));
  },

  markAllAsRead: async (targetRole) => {
    await notificationService.markAllAsRead({ target_role: targetRole });
    set((prev) => ({
      notifications: prev.notifications.map((item) => ({
        ...item,
        is_read: true,
      })),
      unreadCount: 0,
    }));
  },
}));

