import { api } from "@/lib/axios";
import type {
  ComplexListItem,
  ComplexDetail,
  ApiResponse,
  // SubField,
  SubfieldDetail,
  PricingRule,
  PaginationMeta,
} from "@/types";

//payload and response types
interface GetOwnerComplexesResponse {
  complexes: ComplexListItem[];
  pagination: PaginationMeta;
}

interface GetOwnerComplexByIdResponse {
  complex: ComplexDetail;
  pagination: PaginationMeta;
}

interface CreateComplexResponse {
  complex: ComplexListItem;
}

// interface GetOwnerSubfieldsResponse {
//   subfields: SubField[];
// }

interface GetOwnerPricingRulesResponse {
  pricingRules: PricingRule[];
}

export const ownerService = {
  //complexes
  getComplexes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get<ApiResponse<GetOwnerComplexesResponse>>(
      "/complexes",
      { params }
    );
    //response : { data : { message, status, reason, data: { complexes, pagination } } }
    return response.data;
  },
  getComplexById: async (
    id: string,
    params?: { page?: number; limit?: number; search?: string }
  ) => {
    const response = await api.get<ApiResponse<GetOwnerComplexByIdResponse>>(
      `/complexes/${id}`,
      { params }
    );
    return response.data;
  },
  createComplex: async (formData: FormData) => {
    const response = await api.post<ApiResponse<CreateComplexResponse>>(
      "/complexes",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  // getSubfields: async (complexId: string) => {
  //   const response = await api.get<ApiResponse<GetOwnerSubfieldsResponse>>(
  //     `/complexes/${complexId}/sub-fields`
  //   );
  //   return response.data;
  // },
  getSubfieldById: async (id: string) => {
    const response = await api.get<ApiResponse<{ subfield: SubfieldDetail }>>(
      `/sub-fields/${id}`
    );
    return response.data;
  },
  getPricingRules: async (subFieldId: string, dayOfWeek: number) => {
    const response = await api.get<ApiResponse<PricingRule[]>>(
      `/pricing-rules?sub_field_id=${subFieldId}&day_of_week=${dayOfWeek}`
    );
    return response.data;
  },
  createPricingRules: async (payload: {
    subFieldId: string;
    dayOfWeek: number;
    timeSlots: { start_time: string; end_time: string }[];
    basePrice: number;
  }) => {
    const response = await api.post<ApiResponse<GetOwnerPricingRulesResponse>>(
      `/pricing-rules`,
      payload
    );
    return response.data;
  },
  createSubfield: async (complexId: string, formData: FormData) => {
    const response = await api.post<ApiResponse<{ subfield: SubfieldDetail }>>(
      `/complexes/${complexId}/sub-fields`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  updateSubfield: async (
    subfieldId: string,
    data: {
      subfield_name: string;
      sport_type: string;
      capacity: number;
    }
  ) => {
    const response = await api.patch<ApiResponse<{ subfield: SubfieldDetail }>>(
      `/sub-fields/${subfieldId}`,
      data
    );
    return response.data;
  },
  deleteSubfield: async (subfieldId: string) => {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `/sub-fields/${subfieldId}`
    );
    return response.data;
  },
};
