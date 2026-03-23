import { ownerService } from "@/services/owner.service";
import type {
  ApiError,
  ComplexDetail,
  ComplexListItem,
  PaginationMeta,
  StatsMetrics,
} from "@/types";
import { create } from "zustand";

interface ComplexState {
  complexes: ComplexListItem[];
  selectedComplex: ComplexDetail | null;
  selectedComplexPagination: PaginationMeta | null;
  pagination: PaginationMeta | null;
  queryParams: {
    page: number;
    limit: number;
    search: string;
  };
  isLoading: boolean;
  error: string | null;
  dashboardStats: StatsMetrics | null;

  // Actions Fetching
  fetchComplexes: () => Promise<void>;
  fetchComplexById: (
    id: string,
    customParams?: { page?: number; limit?: number; search?: string },
  ) => Promise<void>;

  // Params Updates
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setParams: (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => void;

  // Actions Mutations
  createComplex: (formData: FormData) => Promise<void>;
  updateComplex: (
    complexId: string,
    data: { complex_name?: string; complex_address?: string },
  ) => Promise<void>;
  deleteComplex: (complexId: string) => Promise<void>;
  reactivateComplex: (complexId: string) => Promise<void>;

  // Dashboard
  getStatsMetrics: () => Promise<void>;
}

export const useComplexStore = create<ComplexState>((set, get) => ({
  complexes: [],
  selectedComplex: null,
  selectedComplexPagination: null,
  pagination: null,
  queryParams: {
    page: 1,
    limit: 8,
    search: "",
  },
  isLoading: false,
  error: null,
  dashboardStats: null,

  setParams: (params) => {
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    }));
    get().fetchComplexes();
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    }));
    get().fetchComplexes();
  },

  setSearch: (search: string) => {
    const { queryParams } = get();
    if (queryParams.search === search) return;
    set((state) => ({
      queryParams: { ...state.queryParams, search, page: 1 },
    }));
    get().fetchComplexes();
  },

  fetchComplexes: async () => {
    set({ isLoading: true, error: null });
    const { queryParams } = get();
    try {
      const res = await ownerService.getComplexes(queryParams);
      set({
        complexes: res.data.complexes,
        pagination: res.data.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to fetch complexes",
        isLoading: false,
      });
    }
  },

  fetchComplexById: async (
    id: string,
    customParams?: { page?: number; limit?: number; search?: string },
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getComplexById(id, customParams);
      set({
        selectedComplex: res.data.complex,
        selectedComplexPagination: res.data.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to fetch complex details",
        isLoading: false,
      });
    }
  },

  createComplex: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.createComplex(formData);
      set((state) => ({
        queryParams: { ...state.queryParams, page: 1, search: "" },
      }));
      await get().fetchComplexes();
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to create complex",
        isLoading: false,
      });
    }
  },

  updateComplex: async (
    complexId: string,
    data: { complex_name?: string; complex_address?: string },
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.updateComplex(complexId, data);
      await get().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to update complex",
        isLoading: false,
      });
    }
  },

  deleteComplex: async (complexId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.deleteComplex(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to delete complex",
        isLoading: false,
      });
    }
  },

  reactivateComplex: async (complexId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.reactivateComplex(complexId);
      await get().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to reactivate complex",
        isLoading: false,
      });
    }
  },

  getStatsMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getStatsMetrics();
      set({
        dashboardStats: res.data.stats,
        isLoading: false,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to fetch dashboard stats",
        isLoading: false,
      });
    }
  },
}));
