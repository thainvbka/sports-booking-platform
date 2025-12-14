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
  createSubfield: (complexId: string, formData: FormData) => Promise<void>;
  fetchSubfieldById: (id: string) => Promise<void>;
  fetchPricingRules: (subFieldId: string, dayOfWeek: number) => Promise<void>;
  addPricingRule: (
    subFieldId: string,
    dayOfWeek: number,
    data: any
  ) => Promise<void>;

  //action subfields
  //set param subfield khi load lai trang
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
      await ownerService.createPricingRules(payload);
      // Refresh pricing rules after adding
      await get().fetchPricingRules(subFieldId, dayOfWeek);
    } catch (error: any) {
      set({
        error: error.message || "Failed to add pricing rule",
        isLoading: false,
      });
    }
  },

  createSubfield: async (complexId: string, formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      await ownerService.createSubfield(complexId, formData);
      // Refresh the complex to get updated subfields list
      await get().fetchComplexById(complexId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create subfield";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
}));
