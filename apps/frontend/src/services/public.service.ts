import { api } from "@/lib/axios";
import type { ApiResponse, PaginationMeta, Complex, SubField } from "@/types";

// Public response - use existing types from @/types
interface GetPublicComplexesResponse {
  complexes: Complex[];
  pagination: PaginationMeta;
}

interface GetPublicComplexByIdResponse {
  complex: Complex;
  pagination: PaginationMeta;
}

interface GetPublicSubfieldsResponse {
  subfields: (SubField & { complex_name?: string; complex_address?: string })[];
  pagination: PaginationMeta;
}

export const publicService = {
  getComplexes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sport_types?: string[];
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const response = await api.get<ApiResponse<GetPublicComplexesResponse>>(
      "/public/complexes",
      { params }
    );
    return response.data;
  },

  getComplexById: async (
    id: string,
    params?: { page?: number; limit?: number; search?: string }
  ) => {
    const response = await api.get<ApiResponse<GetPublicComplexByIdResponse>>(
      `/public/complexes/${id}`,
      { params }
    );
    return response.data;
  },

  getSubfields: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sport_types?: string[];
    minCapacity?: number;
    maxCapacity?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const response = await api.get<ApiResponse<GetPublicSubfieldsResponse>>(
      "/public/subfields",
      { params }
    );
    return response.data;
  },

  getSubfieldById: async (id: string) => {
    const response = await api.get<ApiResponse<SubField & { complex_name: string; complex_address: string }>>(
      `/public/subfields/${id}`
    );
    return response.data;
  },
};
