import { adminService } from "@/services/admin.service";
import type { PaginationMeta } from "@/types/index";
import { create } from "zustand";

interface AdminPaymentFilters {
  search?: string;
  status?: string;
}

interface AdminPaymentState {
  payments: unknown[];
  pagination: PaginationMeta | null;
  stats: {
    totalRevenue: number;
    pendingCount: number;
    failedCount: number;
    successCount: number;
    refundedCount: number;
  };
  queryParams: {
    page: number;
    limit: number;
  };
  filters: AdminPaymentFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPayments: () => Promise<void>;
  setFilters: (newFilters: Partial<AdminPaymentFilters>) => void;
  setPage: (page: number) => void;
}

export const useAdminPaymentStore = create<AdminPaymentState>((set, get) => ({
  payments: [],
  pagination: null,
  stats: {
    totalRevenue: 0,
    pendingCount: 0,
    failedCount: 0,
    successCount: 0,
    refundedCount: 0
  },
  queryParams: {
    page: 1,
    limit: 10,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    const { queryParams, filters } = get();
    try {
      const res = await adminService.getPayments({
        page: queryParams.page,
        limit: queryParams.limit,
        ...filters,
      });
      if (res.success && res.data) {
        const data = res.data as {
          payments: unknown[];
          pagination: PaginationMeta | null;
          stats: {
            totalRevenue: number;
            pendingCount: number;
            failedCount: number;
            successCount: number;
            refundedCount: number;
          };
        };
        set({
          payments: data.payments,
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
        error: err?.message || "Failed to fetch system payments",
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      queryParams: { ...state.queryParams, page: 1 },
    }));
    get().fetchPayments();
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    }));
    get().fetchPayments();
  },
}));
