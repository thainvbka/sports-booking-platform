import { adminService } from "@/services/admin.service";
import type { PaginationMeta } from "@/types/index";
import { create } from "zustand";

interface AdminPaymentFilters {
  search?: string;
  status?: string;
}

interface AdminPaymentState {
  payments: any[];
  pagination: PaginationMeta | null;
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
      if (res.success) {
        set({
          payments: res.data.payments,
          pagination: res.data.pagination,
          isLoading: false,
        });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch system payments",
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
