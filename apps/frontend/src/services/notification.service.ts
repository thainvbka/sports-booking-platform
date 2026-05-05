import { api } from "@/lib/axios";
import type {
  ApiResponse,
  NotificationItem,
  NotificationListData,
  NotificationTargetRole,
} from "@/types";

type ListParams = {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: NotificationItem["type"];
  target_role: NotificationTargetRole;
};

type RoleFilterParams = {
  target_role: NotificationTargetRole;
};

export const notificationService = {
  getNotifications: async (params: ListParams) => {
    const response = await api.get<ApiResponse<NotificationListData>>(
      "/notifications",
      { params },
    );
    return response.data;
  },

  getUnreadCount: async (params: RoleFilterParams) => {
    const response = await api.get<ApiResponse<{ unread_count: number }>>(
      "/notifications/unread-count",
      { params },
    );
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<ApiResponse<{ id: string; is_read: boolean }>>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllAsRead: async (params: RoleFilterParams) => {
    const response = await api.patch<ApiResponse<{ updated_count: number }>>(
      "/notifications/read-all",
      {},
      { params },
    );
    return response.data;
  },
};

