import { api } from "@/lib/axios";
import type {
  AdminAnalyticsResponse,
  AdminBookingRow,
  AdminBookingStats,
  AdminComplexesApiResponse,
  AdminRecurringRow,
  AdminUsersResponse,
} from "@/types/admin.types";
import type { ApiResponse, PaginationMeta } from "@/types/index";

export const adminService = {
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
  ): Promise<ApiResponse<unknown>> => {
    const res = await api.patch<ApiResponse<unknown>>(`/admin/users/${id}/status`, {
      role,
      status,
    });
    return res.data;
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<unknown>> => {
    const res = await api.get<ApiResponse<unknown>>("/admin/payments", { params });
    return res.data;
  },

  getBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<{ bookings: AdminBookingRow[]; pagination: PaginationMeta | null; stats: AdminBookingStats }>> => {
    const res = await api.get<ApiResponse<{ bookings: AdminBookingRow[]; pagination: PaginationMeta | null; stats: AdminBookingStats }>>("/admin/bookings", { params });
    return res.data;
  },

  getRecurringBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<{ recurringBookings: AdminRecurringRow[]; pagination: PaginationMeta | null; stats: AdminBookingStats }>> => {
    const res = await api.get<ApiResponse<{ recurringBookings: AdminRecurringRow[]; pagination: PaginationMeta | null; stats: AdminBookingStats }>>("/admin/bookings/recurring", {
      params,
    });
    return res.data;
  },

  getComplexes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<AdminComplexesApiResponse> => {
    const res = await api.get<AdminComplexesApiResponse>("/admin/complexes", {
      params,
    });
    return res.data;
  },

  updateComplexStatus: async (
    id: string,
    status: string,
  ): Promise<ApiResponse<{ complex: unknown }>> => {
    const res = await api.patch<ApiResponse<{ complex: unknown }>>(
      `/admin/complexes/${id}/status`,
      {
        status,
      },
    );
    return res.data;
  },
};
