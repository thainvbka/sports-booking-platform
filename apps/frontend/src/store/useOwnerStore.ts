import { create } from "zustand";
import type {
  ComplexDetail,
  ComplexListItem,
  SubField,
  SubfieldDetail,
  PricingRule,
  PaginationMeta,
} from "@/types";
import { ownerService } from "@/services/owner.service";

interface OwnerState {
  complexes: ComplexListItem[];
  selectedComplex: ComplexDetail | null;
  pagination: PaginationMeta | null;
  queryParams: {
    page: number;
    limit: number;
    search: string;
  };
  isLoading: boolean;
  error: string | null;
  pricingRules: PricingRule[];
  dayOfWeek: number | null;

  //state subfields

  subfields: SubField[];
  selectedSubfield: SubfieldDetail | null;
  //luu thong tin phan trang
  subfieldPagination: PaginationMeta | null;
  //luu thong tin query param
  subfieldQueryParams: {
    page: number;
    limit: number;
    search: string;
  };

  // Actions
  fetchComplexes: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setParams: (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => void;
  fetchComplexById: (id: string) => Promise<void>;
  createComplex: (formData: FormData) => Promise<void>;
  updateComplex: (
    complexId: string,
    data: { complex_name?: string; complex_address?: string }
  ) => Promise<void>;
  deleteComplex: (complexId: string) => Promise<void>;
  reactivateComplex: (complexId: string) => Promise<void>;
  fetchPricingRules: (subFieldId: string, dayOfWeek: number) => Promise<void>;
  addPricingRule: (
    subFieldId: string,
    daysOfWeek: number[],
    data: {
      time_slots: {
        start_time: string;
        end_time: string;
        base_price: number;
      }[];
    }
  ) => Promise<void>;
  updatePricingRule: (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number,
    data: {
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      base_price?: number;
    }
  ) => Promise<void>;
  deletePricingRule: (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number
  ) => Promise<void>;
  bulkDeletePricingRules: (
    ruleIds: string[],
    subFieldId: string,
    dayOfWeek: number
  ) => Promise<void>;
  copyPricingRules: (
    subFieldId: string,
    sourceDay: number,
    targetDays: number[]
  ) => Promise<void>;

  //action subfields
  //set param subfield khi load lai trang
  createSubfield: (complexId: string, formData: FormData) => Promise<void>;
  updateSubfield: (
    subfieldId: string,
    data: { subfield_name: string; sport_type: string; capacity: number }
  ) => Promise<void>;
  deleteSubfield: (subfieldId: string) => Promise<void>;
  fetchSubfieldById: (id: string) => Promise<void>;
  setSubfieldParams: (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => void;
  //chuyển trang subfield
  setSubfieldPage: (page: number) => void;
  //tìm kiếm subfield
  setSubfieldSearch: (search: string) => void;
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
  pagination: null,
  queryParams: {
    page: 1,
    limit: 6,
    search: "",
  },
  subfieldPagination: null,
  subfieldQueryParams: {
    page: 1,
    limit: 6,
    search: "",
  },

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
    if (queryParams.search === search) return; // tránh gọi lại nếu search không đổi
    set((state) => ({
      queryParams: { ...state.queryParams, search, page: 1 },
    }));
    get().fetchComplexes();
  },

  setSubfieldPage: (page: number) => {
    set((state) => ({
      subfieldQueryParams: { ...state.subfieldQueryParams, page },
    }));
    const { selectedComplex } = get();
    if (selectedComplex) {
      get().fetchComplexById(selectedComplex.id);
    }
  },

  setSubfieldSearch: (search: string) => {
    const { subfieldQueryParams, selectedComplex } = get();
    if (subfieldQueryParams.search === search) return; // tránh gọi lại nếu search không đổi
    set((state) => ({
      subfieldQueryParams: { ...state.subfieldQueryParams, search, page: 1 },
    }));
    if (selectedComplex) {
      get().fetchComplexById(selectedComplex.id);
    }
  },
  setSubfieldParams: (params) => {
    set((state) => ({
      subfieldQueryParams: { ...state.subfieldQueryParams, ...params },
    }));
    const { selectedComplex } = get();
    if (selectedComplex) {
      get().fetchComplexById(selectedComplex.id);
    }
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
    const { subfieldQueryParams } = get();
    try {
      const res = await ownerService.getComplexById(id, subfieldQueryParams);
      set({
        selectedComplex: res.data.complex,
        isLoading: false,
        subfields: res.data.complex.sub_fields,
        subfieldPagination: res.data.pagination,
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
      await ownerService.createComplex(formData);
      //reset ve trang dau va tai lai danh sach
      set((state) => ({
        queryParams: { ...state.queryParams, page: 1, search: "" },
      }));
      await get().fetchComplexes();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        // error: error.message || "Failed to create complex",
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
      set({ pricingRules: res.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch pricing rules",
        isLoading: false,
        pricingRules: [],
      });
    }
  },
  addPricingRule: async (
    subFieldId: string,
    daysOfWeek: number[],
    data: {
      time_slots: {
        start_time: string;
        end_time: string;
        base_price: number;
      }[];
    }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        sub_field_id: subFieldId,
        day_of_week: daysOfWeek,
        time_slots: data.time_slots,
      };
      await ownerService.createPricingRules(payload);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add pricing rule";
      throw new Error(errorMessage);
    }
  },

  updatePricingRule: async (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number,
    data: {
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      base_price?: number;
    }
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.updatePricingRule(ruleId, {
        sub_field_id: subFieldId,
        ...data,
      });
      // Refresh pricing rules after update
      await get().fetchPricingRules(subFieldId, dayOfWeek);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update pricing rule";
      throw new Error(errorMessage);
    }
  },

  deletePricingRule: async (
    ruleId: string,
    subFieldId: string,
    dayOfWeek: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.deletePricingRule(ruleId);
      // Refresh pricing rules after delete
      await get().fetchPricingRules(subFieldId, dayOfWeek);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete pricing rule";
      throw new Error(errorMessage);
    }
  },

  bulkDeletePricingRules: async (
    ruleIds: string[],
    subFieldId: string,
    dayOfWeek: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.bulkDeletePricingRules(ruleIds);
      // Refresh pricing rules after bulk delete
      await get().fetchPricingRules(subFieldId, dayOfWeek);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to bulk delete pricing rules";
      throw new Error(errorMessage);
    }
  },

  copyPricingRules: async (
    subFieldId: string,
    sourceDay: number,
    targetDays: number[]
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.copyPricingRules(subFieldId, sourceDay, targetDays);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to copy pricing rules";
      throw new Error(errorMessage);
    }
  },

  createSubfield: async (complexId: string, formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.createSubfield(complexId, formData);
      //reset ve trang dau va tai lai danh sach
      set((state) => ({
        subfieldQueryParams: {
          ...state.subfieldQueryParams,
          page: 1,
          search: "",
        },
      }));
      await get().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({
        // error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  updateSubfield: async (
    subfieldId: string,
    data: { subfield_name: string; sport_type: string; capacity: number }
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.updateSubfield(subfieldId, data);
      // Refresh subfield details after update
      const updatedSubfield = await ownerService.getSubfieldById(subfieldId);
      set({
        selectedSubfield: updatedSubfield.data.subfield,
        isLoading: false,
      });

      // Also refresh parent complex data if it's currently loaded
      const { selectedComplex } = get();
      if (
        selectedComplex &&
        updatedSubfield.data.subfield.complex_id === selectedComplex.id
      ) {
        await get().fetchComplexById(selectedComplex.id);
      }
    } catch (error: unknown) {
      set({
        // error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  deleteSubfield: async (subfieldId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.deleteSubfield(subfieldId);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({
        // error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  updateComplex: async (
    complexId: string,
    data: { complex_name?: string; complex_address?: string }
  ) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.updateComplex(complexId, data);
      // Refresh complex details after update
      await get().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({
        // error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  deleteComplex: async (complexId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.deleteComplex(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({
        // error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  reactivateComplex: async (complexId: string) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.reactivateComplex(complexId);
      // Refresh complex details after reactivation
      await get().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({
        // error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
}));
