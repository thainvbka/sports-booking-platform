import type { PaginationMeta, ProductStatus, ProductType, SportType } from "./index";


export interface OwnerProduct {
  id: string;
  complex_id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  sport_type?: SportType | null;
  status: ProductStatus;
  type: ProductType;
  created_at: string;
  updated_at: string;
  complex: {
    complex_name: string;
  };
}

export interface OwnerProductsResponse {
  products: OwnerProduct[];
  pagination: PaginationMeta;
}

export interface ProductMutationResponse {
  product: OwnerProduct;
}

export interface ProductQueryParams {
  complex_id?: string;
  status?: ProductStatus;
  sport_type?: SportType;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  max_stock?: number;
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  complex_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sport_type?: SportType | null;
  status?: ProductStatus;
  type?: ProductType;
  image?: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sport_type?: SportType | null;
  status?: ProductStatus;
  type?: ProductType;
  image?: string;
}

export interface UpdateProductStockPayload {
  increment: number;
}
