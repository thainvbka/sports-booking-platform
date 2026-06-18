import { adminService } from "@/services/admin.service";
import type { AdminAnalytics } from "@/types/admin.types";
import { create } from "zustand";

interface AdminState {
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;

  fetchAnalytics: () => Promise<void>;
  fetchAllData: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  analytics: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getAnalytics();
      if (res.success) {
        set({ analytics: res.data.analytics, isLoading: false });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error) {
      const err = error as { message?: string } | null;
      set({
        error: err?.message || "Failed to fetch analytics",
        isLoading: false,
      });
    }
  },

  fetchAllData: async () => {
    await get().fetchAnalytics();
  },
}));
