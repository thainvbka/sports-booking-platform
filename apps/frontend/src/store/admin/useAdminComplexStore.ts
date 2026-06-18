import { adminService } from "@/services/admin.service";
import type { AdminComplex, AdminComplexStats } from "@/types/admin.types";
import type { PaginationMeta } from "@/types/index";
import { create } from "zustand";

interface AdminComplexFilters {
  search?: string;
  status?: string;
}

interface AdminComplexState {
  complexes: AdminComplex[];
  pagination: PaginationMeta | null;
  stats: AdminComplexStats;
  queryParams: {
    page: number;
    limit: number;
  };
  filters: AdminComplexFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchComplexes: () => Promise<void>;
  setFilters: (filters: Partial<AdminComplexFilters>) => void;
  setPage: (page: number) => void;
  updateComplexStatus: (id: string, status: string) => Promise<void>;
}

export const useAdminComplexStore = create<AdminComplexState>((set, get) => ({
  complexes: [],
  pagination: null,
  stats: {
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    rejected: 0,
    draft: 0,
  },
  queryParams: {
    page: 1,
    limit: 10,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchComplexes: async () => {
    set({ isLoading: true, error: null });
    const { queryParams, filters } = get();
    try {
      const res = await adminService.getComplexes({
        page: queryParams.page,
        limit: queryParams.limit,
        ...filters,
      });
      if (res.success) {
        set({
          complexes: res.data.complexes,
          pagination: res.data.pagination,
          stats: res.data.stats,
          isLoading: false,
        });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (error) {
      const err = error as { message?: string } | null;
      set({
        error: err?.message || "Failed to fetch complexes",
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      queryParams: { ...state.queryParams, page: 1 },
    }));
    get().fetchComplexes();
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    }));
    get().fetchComplexes();
  },

  updateComplexStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const res = await adminService.updateComplexStatus(id, status);
      if (res.success) {
        await get().fetchComplexes();
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      const err = error as { message?: string } | null;
      set({ error: err?.message || "Failed to update complex status" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
