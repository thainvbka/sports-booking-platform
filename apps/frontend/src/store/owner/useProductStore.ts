import { productService } from "@/services/product.service";
import type {
  ApiError,
  ComplexListItem,
  CreateProductPayload,
  OwnerProduct,
  PaginationMeta,
  ProductQueryParams,
  ProductStatus,
  SportType,
  UpdateProductPayload,
  UpdateProductStockPayload,
} from "@/types";
import { create } from "zustand";

interface ProductQueryState extends ProductQueryParams {
  page: number;
  limit: number;
}

interface ProductFilterState {
  complex_id?: string;
  status?: ProductStatus;
  sport_type?: SportType;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  max_stock?: number;
  search?: string;
}

interface ProductState {
  products: OwnerProduct[];
  complexes: ComplexListItem[];
  pagination: PaginationMeta | null;
  queryParams: ProductQueryState;
  filters: ProductFilterState;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchComplexes: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<ProductFilterState>) => void;
  clearFilters: () => void;
  createProduct: (payload: CreateProductPayload, imageFile?: File | null) => Promise<void>;
  updateProduct: (
    id: string,
    payload: UpdateProductPayload,
    imageFile?: File | null,
  ) => Promise<void>;
  incrementStock: (id: string, payload: UpdateProductStockPayload) => Promise<void>;
}

const sanitizeQueryParams = (query: ProductQueryState): ProductQueryParams => {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return acc;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {} as ProductQueryParams);
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  complexes: [],
  pagination: null,
  queryParams: {
    page: 1,
    limit: 10,
  },
  filters: {},
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });

    try {
      const { queryParams } = get();
      const response = await productService.getOwnerProducts(
        sanitizeQueryParams(queryParams),
      );

      set({
        products: response.data.products,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Không thể tải danh sách sản phẩm",
        products: [],
        isLoading: false,
      });
    }
  },

  fetchComplexes: async () => {
    try {
      const response = await productService.getOwnerComplexesForFilter({
        page: 1,
        limit: 100,
      });

      set({ complexes: response.data.complexes });
    } catch (error) {
      console.error("Failed to fetch complexes for product filter", error);
    }
  },

  setPage: (page: number) => {
    set((state) => ({
      queryParams: {
        ...state.queryParams,
        page,
      },
    }));

    get().fetchProducts();
  },

  setSearch: (search: string) => {
    const normalizedSearch = search.trim();
    const nextSearch = normalizedSearch || undefined;

    if (get().queryParams.search === nextSearch) {
      return;
    }

    set((state) => ({
      queryParams: {
        ...state.queryParams,
        search: nextSearch,
        page: 1,
      },
      filters: {
        ...state.filters,
        search: nextSearch,
      },
    }));

    get().fetchProducts();
  },

  setFilters: (newFilters: Partial<ProductFilterState>) => {
    set((state) => {
      const mergedFilters = {
        ...state.filters,
        ...newFilters,
      };

      return {
        queryParams: {
          ...state.queryParams,
          ...mergedFilters,
          page: 1,
        },
        filters: {
          ...mergedFilters,
        },
      };
    });

    get().fetchProducts();
  },

  clearFilters: () => {
    set((state) => ({
      filters: {},
      queryParams: {
        page: 1,
        limit: state.queryParams.limit,
      },
    }));

    get().fetchProducts();
  },

  createProduct: async (payload: CreateProductPayload, imageFile?: File | null) => {
    set({ isSubmitting: true, error: null });

    try {
      await productService.createProduct(payload, imageFile);
      await get().fetchProducts();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Không thể tạo sản phẩm",
      });
      throw apiError;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProduct: async (
    id: string,
    payload: UpdateProductPayload,
    imageFile?: File | null,
  ) => {
    set({ isSubmitting: true, error: null });

    try {
      await productService.updateProduct(id, payload, imageFile);
      await get().fetchProducts();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Không thể cập nhật sản phẩm",
      });
      throw apiError;
    } finally {
      set({ isSubmitting: false });
    }
  },

  incrementStock: async (id: string, payload: UpdateProductStockPayload) => {
    set({ isSubmitting: true, error: null });

    try {
      await productService.incrementProductStock(id, payload);
      await get().fetchProducts();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({
        error: apiError?.message || "Không thể cập nhật tồn kho",
      });
      throw apiError;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
