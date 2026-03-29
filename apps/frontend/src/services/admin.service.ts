import { api } from "@/lib/axios";
import type {
  AdminAnalyticsResponse,
  AdminStatsResponse,
  AdminUsersResponse,
} from "@/types/admin.types";
import type { ApiResponse } from "@/types/index";

export const adminService = {
  getStats: async (): Promise<AdminStatsResponse> => {
    const res = await api.get<AdminStatsResponse>("/admin/stats");
    return res.data;
  },

  getAnalytics: async (): Promise<AdminAnalyticsResponse> => {
    const res = await api.get<AdminAnalyticsResponse>("/admin/analytics");
    return res.data;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<AdminUsersResponse>> => {
    const res = await api.get<ApiResponse<AdminUsersResponse>>("/admin/users", {
      params,
    });
    return res.data;
  },

  updateUserStatus: async (
    id: string,
    role: string,
    status: string,
  ): Promise<ApiResponse<any>> => {
    const res = await api.patch<ApiResponse<any>>(`/admin/users/${id}/status`, {
      role,
      status,
    });
    return res.data;
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    const res = await api.get<ApiResponse<any>>("/admin/payments", { params });
    return res.data;
  },

  getBookings: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> => {
    const res = await api.get<ApiResponse<any>>("/admin/bookings", { params });
    return res.data;
  },
};
