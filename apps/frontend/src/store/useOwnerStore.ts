import { create } from "zustand";
import type {
  ComplexDetail,
  ComplexListItem,
  SubField,
  SubfieldDetail,
  PricingRule,
} from "@/types";
import { ownerService } from "@/services/owner.service";

interface OwnerState {
  complexes: ComplexListItem[];
  selectedComplex: ComplexDetail | null;
  isLoading: boolean;
  error: string | null;
  subfields: SubField[];
  selectedSubfield: SubfieldDetail | null;
  pricingRules: PricingRule[];
  dayOfWeek: number | null;

  // Actions
  fetchComplexes: () => Promise<void>;
  fetchComplexById: (id: string) => Promise<void>;
  createComplex: (formData: FormData) => Promise<void>;
  fetchSubfieldById: (id: string) => Promise<void>;
  fetchPricingRules: (subFieldId: string, dayOfWeek: number) => Promise<void>;
  addPricingRule: (
    subFieldId: string,
    dayOfWeek: number,
    data: any
  ) => Promise<void>;
}

export const useOwnerStore = create<OwnerState>((set, get) => ({
  complexes: [],
  selectedComplex: null,
  isLoading: false,
  error: null,
  subfields: [],
  selectedSubfield: null,
  pricingRules: [],
  dayOfWeek: null,

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
      set({
        selectedComplex: res.data.complex,
        isLoading: false,
        subfields: res.data.complex.sub_fields,
      });
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

  fetchSubfieldById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getSubfieldById(id);
      set({ selectedSubfield: res.data.subfield, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch subfield details",
        isLoading: false,
      });
    }
  },
  fetchPricingRules: async (subFieldId: string, dayOfWeek: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ownerService.getPricingRules(subFieldId, dayOfWeek);
      set({ pricingRules: res.data.pricingRules, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch pricing rules",
        isLoading: false,
        pricingRules: [],
      });
    }
  },
  addPricingRule: async (subFieldId: string, dayOfWeek: number, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        subFieldId: subFieldId,
        dayOfWeek: dayOfWeek,
        timeSlots: [{ start_time: data.start_time, end_time: data.end_time }],
        basePrice: data.base_price,
      };
      const res = await ownerService.createPricingRules(payload);
      // Refresh pricing rules after adding
      await get().fetchPricingRules(subFieldId, dayOfWeek);
    } catch (error: any) {
      set({
        error: error.message || "Failed to add pricing rule",
        isLoading: false,
      });
    }
  },
}));
