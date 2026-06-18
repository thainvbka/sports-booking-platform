import { adminService } from "@/services/admin.service";
import type { PaginationMeta } from "@/types/index";
import { create } from "zustand";

interface AdminRecurringBookingFilters {
  search?: string;
  status?: string;
}

interface AdminRecurringBookingState {
  recurringBookings: unknown[];
  pagination: PaginationMeta | null;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    canceled: number;
  };
  queryParams: { page: number; limit: number };
  filters: AdminRecurringBookingFilters;
  isLoading: boolean;
  error: string | null;

  fetchRecurringBookings: () => Promise<void>;
  setFilters: (filters: Partial<AdminRecurringBookingFilters>) => void;
  setPage: (page: number) => void;
}

export const useAdminRecurringBookingStore =
  create<AdminRecurringBookingState>((set, get) => ({
    recurringBookings: [],
    pagination: null,
    stats: { total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 },
    queryParams: { page: 1, limit: 10 },
    filters: {},
    isLoading: false,
    error: null,

    fetchRecurringBookings: async () => {
      set({ isLoading: true, error: null });
      const { queryParams, filters } = get();
      try {
        const res = await adminService.getRecurringBookings({
          page: queryParams.page,
          limit: queryParams.limit,
          ...filters,
        });
        if (res.success && res.data) {
          const data = res.data as {
            recurringBookings: unknown[];
            pagination: PaginationMeta | null;
            stats: {
              total: number;
              pending: number;
              confirmed: number;
              completed: number;
              canceled: number;
            };
          };
          set({
            recurringBookings: data.recurringBookings,
            pagination: data.pagination,
            stats: data.stats,
            isLoading: false,
          });
        } else {
          set({ error: res.message, isLoading: false });
        }
      } catch (error) {
        const err = error as { message?: string } | null;
        set({
          error: err?.message || "Failed to fetch recurring bookings",
          isLoading: false,
        });
      }
    },

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
        queryParams: { ...state.queryParams, page: 1 },
      }));
      get().fetchRecurringBookings();
    },

    setPage: (page) => {
      set((state) => ({ queryParams: { ...state.queryParams, page } }));
      get().fetchRecurringBookings();
    },
  }));
