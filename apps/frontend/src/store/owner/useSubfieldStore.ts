import { ownerService } from "@/services/owner.service";
import type {
  ApiError,
  PaginationMeta,
  SubField,
  SubfieldDetail,
} from "@/types";
import { create } from "zustand";
import { useComplexStore } from "./useComplexStore";

interface SubfieldState {
  subfields: SubField[];
  selectedSubfield: SubfieldDetail | null;
  subfieldPagination: PaginationMeta | null;
  subfieldQueryParams: {
    page: number;
    limit: number;
    search: string;
  };
  isLoading: boolean;
  error: string | null;

  // Sync state helpers
  setSubfieldsState: (
    subfields: SubField[],
    pagination: PaginationMeta,
  ) => void;

  // Params updates
  setSubfieldParams: (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => void;
  setSubfieldPage: (page: number) => void;
  setSubfieldSearch: (search: string) => void;

  // Actions Fetching
  fetchSubfieldById: (id: string) => Promise<void>;

  // Actions Mutations
  createSubfield: (complexId: string, formData: FormData) => Promise<void>;
  updateSubfield: (
    subfieldId: string,
    data: { subfield_name: string; sport_type: string; capacity: number },
  ) => Promise<void>;
  deleteSubfield: (subfieldId: string) => Promise<void>;
}

export const useSubfieldStore = create<SubfieldState>((set, get) => ({
  subfields: [],
  selectedSubfield: null,
  subfieldPagination: null,
  subfieldQueryParams: {
    page: 1,
    limit: 8,
    search: "",
  },
  isLoading: false,
  error: null,

  setSubfieldsState: (subfields, pagination) => {
    set({ subfields, subfieldPagination: pagination });
  },

  setSubfieldPage: (page: number) => {
    set((state) => ({
      subfieldQueryParams: { ...state.subfieldQueryParams, page },
    }));

    // Attempt to trigger a refetch in useComplexStore since subfields are loaded implicitly there
    const complexId = useComplexStore.getState().selectedComplex?.id;
    if (complexId) {
      useComplexStore
        .getState()
        .fetchComplexById(complexId, get().subfieldQueryParams);
      // Note: Ideally, subfields list should have its own fetchSubfields API
    }
  },

  setSubfieldSearch: (search: string) => {
    const { subfieldQueryParams } = get();
    if (subfieldQueryParams.search === search) return;
    set((state) => ({
      subfieldQueryParams: { ...state.subfieldQueryParams, search, page: 1 },
    }));

    const complexId = useComplexStore.getState().selectedComplex?.id;
    if (complexId) {
      useComplexStore
        .getState()
        .fetchComplexById(complexId, get().subfieldQueryParams);
    }
  },

  setSubfieldParams: (params) => {
    set((state) => ({
      subfieldQueryParams: { ...state.subfieldQueryParams, ...params },
    }));

    const complexId = useComplexStore.getState().selectedComplex?.id;
    if (complexId) {
      useComplexStore
        .getState()
        .fetchComplexById(complexId, get().subfieldQueryParams);
    }
  },

  fetchSubfieldById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getSubfieldById(id);
      set({ selectedSubfield: res.data.subfield, isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to fetch subfield details",
        isLoading: false,
      });
    }
  },

  createSubfield: async (complexId: string, formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.createSubfield(complexId, formData);
      set((state) => ({
        subfieldQueryParams: {
          ...state.subfieldQueryParams,
          page: 1,
          search: "",
        },
      }));
      // trigger refresh complex
      await useComplexStore.getState().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to create subfield",
        isLoading: false,
      });
    }
  },

  updateSubfield: async (
    subfieldId: string,
    data: { subfield_name: string; sport_type: string; capacity: number },
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.updateSubfield(subfieldId, data);
      const res = await ownerService.getSubfieldById(subfieldId);
      set({
        selectedSubfield: res.data.subfield,
        isLoading: false,
      });

      const complexId = useComplexStore.getState().selectedComplex?.id;
      if (complexId && res.data.subfield.complex_id === complexId) {
        await useComplexStore.getState().fetchComplexById(complexId);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to update subfield",
        isLoading: false,
      });
    }
  },

  deleteSubfield: async (subfieldId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.deleteSubfield(subfieldId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Failed to delete subfield",
        isLoading: false,
      });
    }
  },
}));
