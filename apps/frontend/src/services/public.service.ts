import { api } from "@/lib/axios";
import type {
  ApiResponse,
  GetPublicComplexByIdResponse,
  GetPublicComplexesResponse,
  GetPublicSubfieldsResponse,
  PricingRule,
  SubField,
  SubfieldAvailabilityResponse,
} from "@/types";

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
      { params },
    );
    return response.data;
  },

  getComplexById: async (
    id: string,
    params?: { page?: number; limit?: number; search?: string },
  ) => {
    const response = await api.get<ApiResponse<GetPublicComplexByIdResponse>>(
      `/public/complexes/${id}`,
      { params },
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
      { params },
    );
    return response.data;
  },

  getSubfieldById: async (id: string) => {
    const response = await api.get<
      ApiResponse<{
        subfield: Omit<SubField, "status" | "createdAt" | "updatedAt"> & {
          pricing_rules?: PricingRule[];
        };
      }>
    >(`/public/subfields/${id}`);
    return response.data;
  },

  getSubfieldAvailability: async (id: string, date: string) => {
    const response = await api.get<
      ApiResponse<{ availability: SubfieldAvailabilityResponse }>
    >(`/public/subfields/${id}/availability`, { params: { date } });
    return response.data;
  },
};
