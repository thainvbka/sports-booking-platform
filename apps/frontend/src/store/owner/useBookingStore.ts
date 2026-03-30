import { ownerService } from "@/services/owner.service";
import type {
  ApiError,
  BookingStatus,
  OwnerBookingResponse,
  PaginationMeta,
} from "@/types";
import type { DateRange } from "react-day-picker";
import { create } from "zustand";

interface BookingFilters {
  status?: BookingStatus;
  dateRange?: DateRange;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

interface BookingState {
  bookings: OwnerBookingResponse[];
  stats: {
    total: number;
    pending: number;
    canceled: number;
    confirmed: number;
    completed: number;
  };
  pagination: PaginationMeta | null;
  queryParams: {
    page: number;
    limit: number;
  };
  filters: BookingFilters;
  isLoading: boolean;
  error: string | null;

  // Actions Fetching
  fetchBookings: () => Promise<void>;
  fetchStats: () => Promise<void>;

  // Filter Actions
  setFilters: (filters: Partial<BookingFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;

  // Mutation Actions
  confirmBooking: (id: string, type: "SINGLE" | "RECURRING") => Promise<void>;
  cancelBooking: (id: string, type: "SINGLE" | "RECURRING") => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  stats: {
    total: 0,
    pending: 0,
    canceled: 0,
    confirmed: 0,
    completed: 0,
  },
  pagination: null,
  queryParams: {
    page: 1,
    limit: 8,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    const { queryParams, filters } = get();

    try {
      const filterParams: Record<string, string | number | Date> = {};

      if (filters.search?.trim()) {
        filterParams.search = filters.search.trim();
      }

      if (filters.status) {
        filterParams.status = filters.status;
      }

      if (filters.dateRange?.from) {
        filterParams.start_date = filters.dateRange.from;
      }

      if (filters.dateRange?.to) {
        filterParams.end_date = filters.dateRange.to;
      }

      if (filters.minPrice) {
        filterParams.min_price = filters.minPrice;
      }

      if (filters.maxPrice) {
        filterParams.max_price = filters.maxPrice;
      }

      const res = await ownerService.getOwnerBookings({
        page: queryParams.page,
        limit: queryParams.limit,
        filter: Object.keys(filterParams).length > 0 ? filterParams : undefined,
      });

      set({
        bookings: res.data.bookings || [],
        pagination: res.data.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Không thể tải danh sách đặt sân",
        isLoading: false,
        bookings: [],
      });
    }
  },

  fetchStats: async () => {
    try {
      const res = await ownerService.getOwnerBookingStats();
      set({
        stats: {
          total: res.data.stats.total,
          pending: res.data.stats.pending,
          canceled: res.data.stats.canceled,
          confirmed: res.data.stats.confirmed,
          completed: res.data.stats.completed,
        },
      });
    } catch (error: unknown) {
      console.error("Failed to fetch booking stats:", error);
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      queryParams: { ...state.queryParams, page: 1 },
    }));
    get().fetchBookings();
  },

  clearFilters: () => {
    set({
      filters: {},
      queryParams: { page: 1, limit: 8 },
    });
    get().fetchBookings();
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    }));
    get().fetchBookings();
  },

  confirmBooking: async (id, type) => {
    set({ isLoading: true });
    try {
      if (type === "SINGLE") {
        await ownerService.confirmBooking(id);
      } else {
        await ownerService.confirmRecurringBooking(id);
      }
      await Promise.all([get().fetchBookings(), get().fetchStats()]);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      throw apiError; // Re-throw to handle in component (e.g. toast)
    } finally {
      set({ isLoading: false });
    }
  },

  cancelBooking: async (id, type) => {
    set({ isLoading: true });
    try {
      if (type === "SINGLE") {
        await ownerService.cancelOwnerBooking(id);
      } else {
        await ownerService.cancelOwnerRecurringBooking(id);
      }
      await Promise.all([get().fetchBookings(), get().fetchStats()]);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      throw apiError;
    } finally {
      set({ isLoading: false });
    }
  },
}));
