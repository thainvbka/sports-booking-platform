import { adminService } from "@/services/admin.service";
import type { AdminAnalytics, AdminStats } from "@/types/admin.types";
import { create } from "zustand";

interface AdminState {
  stats: AdminStats | null;
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchAllData: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  analytics: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getStats();
      if (res.success) {
        set({ stats: res.data.stats, isLoading: false });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch stats",
        isLoading: false,
      });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getAnalytics();
      if (res.success) {
        set({ analytics: res.data.analytics, isLoading: false });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch analytics",
        isLoading: false,
      });
    }
  },

  fetchAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAnalytics(),
      ]);

      if (statsRes.success && analyticsRes.success) {
        set({
          stats: statsRes.data.stats,
          analytics: analyticsRes.data.analytics,
          isLoading: false,
        });
      } else {
        set({
          error: statsRes.message || analyticsRes.message,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch admin data",
        isLoading: false,
      });
    }
  },
}));
