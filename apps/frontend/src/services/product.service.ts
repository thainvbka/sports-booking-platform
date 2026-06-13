import { api } from "@/lib/axios";
import type {
  ApiResponse,
  ComplexListItem,
  CreateProductPayload,
  GetOwnerComplexesResponse,
  OwnerProduct,
  OwnerProductsResponse,
  PaginationMeta,
  ProductMutationResponse,
  ProductQueryParams,
  UpdateProductPayload,
  UpdateProductStockPayload,
} from "@/types";

type OwnerProductRaw = Omit<OwnerProduct, "price" | "stock"> & {
  price: number | string;
  stock: number | string;
};

type OwnerProductsResponseRaw = {
  products: OwnerProductRaw[];
  pagination: PaginationMeta;
};

type ProductMutationResponseRaw = {
  product: OwnerProductRaw;
};

const normalizeProduct = (product: OwnerProductRaw): OwnerProduct => ({
  ...product,
  price: Number(product.price),
  stock: Number(product.stock),
});

const normalizeProductsResponse = (
  data: {
    products: OwnerProductRaw[];
    pagination: PaginationMeta;
  },
): OwnerProductsResponse => ({
  products: data.products.map(normalizeProduct),
  pagination: data.pagination,
});

const toProductFormData = (
  payload: CreateProductPayload | UpdateProductPayload,
  imageFile?: File | null,
) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      formData.append(key, "null");
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(","));
      return;
    }

    formData.append(key, String(value));
  });

  if (imageFile) {
    formData.append("product_image", imageFile);
  }

  return formData;
};

export const productService = {
  getOwnerProducts: async (params?: ProductQueryParams) => {
    const response = await api.get<ApiResponse<OwnerProductsResponseRaw>>(
      "/products",
      { params },
    );

    return {
      ...response.data,
      data: normalizeProductsResponse(response.data.data),
    };
  },

  createProduct: async (payload: CreateProductPayload, imageFile?: File | null) => {
    const formData = toProductFormData(payload, imageFile);

    const response = await api.post<ApiResponse<ProductMutationResponseRaw>>(
      "/products",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      ...response.data,
      data: {
        product: normalizeProduct(response.data.data.product),
      },
    } as ApiResponse<ProductMutationResponse>;
  },

  updateProduct: async (
    id: string,
    payload: UpdateProductPayload,
    imageFile?: File | null,
  ) => {
    const formData = toProductFormData(payload, imageFile);

    const response = await api.patch<ApiResponse<ProductMutationResponseRaw>>(
      `/products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      ...response.data,
      data: {
        product: normalizeProduct(response.data.data.product),
      },
    } as ApiResponse<ProductMutationResponse>;
  },

  incrementProductStock: async (id: string, payload: UpdateProductStockPayload) => {
    const response = await api.patch<ApiResponse<ProductMutationResponseRaw>>(
      `/products/${id}/stock`,
      payload,
    );

    return {
      ...response.data,
      data: {
        product: normalizeProduct(response.data.data.product),
      },
    } as ApiResponse<ProductMutationResponse>;
  },

  getOwnerComplexesForFilter: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<GetOwnerComplexesResponse>>(
      "/complexes",
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
        },
      },
    );

    return {
      ...response.data,
      data: {
        complexes: response.data.data.complexes as ComplexListItem[],
        pagination: response.data.data.pagination,
      },
    } as ApiResponse<GetOwnerComplexesResponse>;
  },
};
