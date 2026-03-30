import { adminService } from "@/services/admin.service";
import type { PaginationMeta } from "@/types/index";
import { create } from "zustand";

interface AdminBookingFilters {
  search?: string;
  status?: string;
}

interface AdminBookingState {
  bookings: any[];
  pagination: PaginationMeta | null;
  queryParams: {
    page: number;
    limit: number;
  };
  filters: AdminBookingFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBookings: () => Promise<void>;
  setFilters: (filters: Partial<AdminBookingFilters>) => void;
  setPage: (page: number) => void;
}

export const useAdminBookingStore = create<AdminBookingState>((set, get) => ({
  bookings: [],
  pagination: null,
  queryParams: {
    page: 1,
    limit: 10,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    const { queryParams, filters } = get();
    try {
      const res = await adminService.getBookings({
        page: queryParams.page,
        limit: queryParams.limit,
        ...filters,
      });
      if (res.success) {
        set({
          bookings: res.data.bookings,
          pagination: res.data.pagination,
          isLoading: false,
        });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch system bookings",
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      queryParams: { ...state.queryParams, page: 1 },
    }));
    get().fetchBookings();
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    }));
    get().fetchBookings();
  },
}));
