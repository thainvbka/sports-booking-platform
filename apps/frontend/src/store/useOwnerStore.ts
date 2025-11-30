import { create } from "zustand";
import type { ComplexDetail, ComplexListItem } from "@/types";
import { ownerService } from "@/services/owner.service";

interface OwnerState {
  complexes: ComplexListItem[];
  selectedComplex: ComplexDetail | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchComplexes: () => Promise<void>;
  fetchComplexById: (id: string) => Promise<void>;
  createComplex: (formData: FormData) => Promise<void>;
}

export const useOwnerStore = create<OwnerState>((set) => ({
  complexes: [],
  selectedComplex: null,
  isLoading: false,
  error: null,

  fetchComplexes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getComplexes();
      set({ complexes: res.data.complexes, isLoading: false });
      console.log("Fetched complexes:", res.data.complexes);
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch complexes",
        isLoading: false,
      });
    }
  },
  fetchComplexById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getComplexById(id);
      set({ selectedComplex: res.data.complex, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch complex details",
        isLoading: false,
      });
    }
  },
  createComplex: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.createComplex(formData);
      set((state) => ({
        complexes: [res.data.complex, ...state.complexes],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to create complex",
        isLoading: false,
      });
    }
  },
}));
