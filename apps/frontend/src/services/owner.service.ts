import { api } from "@/lib/axios";
import type {
  ComplexListItem,
  ComplexDetail,
  ApiResponse,
  // SubField,
  SubfieldDetail,
  PricingRule,
  PaginationMeta,
  StatsMetrics,
  OwnerBookingResponse,
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
    sub_field_id: string;
    day_of_week: number[];
    time_slots: { start_time: string; end_time: string; base_price: number }[];
  }) => {
    const response = await api.post<ApiResponse<GetOwnerPricingRulesResponse>>(
      `/pricing-rules`,
      payload
    );
    return response.data;
  },
  updatePricingRule: async (
    ruleId: string,
    data: {
      sub_field_id: string;
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      base_price?: number;
    }
  ) => {
    const response = await api.patch<ApiResponse<{ pricingRule: PricingRule }>>(
      `/pricing-rules/${ruleId}`,
      data
    );
    return response.data;
  },
  deletePricingRule: async (ruleId: string) => {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `/pricing-rules/${ruleId}`
    );
    return response.data;
  },
  bulkDeletePricingRules: async (pricingRuleIds: string[]) => {
    const response = await api.post<ApiResponse<{ deletedCount: number }>>(
      `/pricing-rules/bulk-delete`,
      { pricingRuleIds }
    );
    return response.data;
  },
  copyPricingRules: async (
    subFieldId: string,
    sourceDay: number,
    targetDays: number[]
  ) => {
    const response = await api.post<
      ApiResponse<{
        copiedFrom: number;
        copiedTo: number[];
        rulesCreated: number;
      }>
    >(`/pricing-rules/copy`, {
      sub_field_id: subFieldId,
      source_day: sourceDay,
      target_days: targetDays,
    });
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
  updateComplex: async (
    complexId: string,
    data: {
      complex_name?: string;
      complex_address?: string;
    }
  ) => {
    const response = await api.patch<ApiResponse<{ complex: ComplexDetail }>>(
      `/complexes/${complexId}`,
      data
    );
    return response.data;
  },
  deleteComplex: async (complexId: string) => {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `/complexes/${complexId}`
    );
    return response.data;
  },
  reactivateComplex: async (complexId: string) => {
    const response = await api.post<ApiResponse<Record<string, never>>>(
      `/complexes/${complexId}/reactivate`
    );
    return response.data;
  },
  //stripe
  createStripeLink: async () => {
    const response = await api.post<ApiResponse<{ url: string }>>(
      `/payments/stripe/connect-account`
    );
    return response.data.data;
  },
  getStripeStatus: async () => {
    const response = await api.get<ApiResponse<{ isComplete: boolean }>>(
      `/payments/stripe/check-status`
    );
    console.log("Stripe status response:", response.data);
    return response.data.data;
  },

  // Owner Booking Management
  getOwnerBookings: async (params?: {
    page?: number;
    limit?: number;
    filter?: {
      search?: string;
      status?: string;
      start_date?: Date;
      end_date?: Date;
      min_price?: number;
      max_price?: number;
    };
  }) => {
    const queryParams: Record<string, string> = {};

    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();

    // Stringify filter object if provided
    if (params?.filter) {
      const filter = {
        ...params.filter,
        start_date: params.filter.start_date?.toISOString(),
        end_date: params.filter.end_date?.toISOString(),
      };
      queryParams.filter = JSON.stringify(filter);
    }

    const response = await api.get<
      ApiResponse<{
        bookings: OwnerBookingResponse[];
        pagination: PaginationMeta;
      }>
    >("/bookings/all", { params: queryParams });

    return response.data;
  },

  confirmBooking: async (bookingId: string) => {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      `/bookings/confirm/${bookingId}`
    );
    return response.data;
  },

  confirmRecurringBooking: async (recurringBookingId: string) => {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      `/bookings/recurring/confirm/${recurringBookingId}`
    );
    return response.data;
  },

  cancelOwnerBooking: async (bookingId: string) => {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      `/bookings/cancel/${bookingId}`
    );
    return response.data;
  },

  cancelOwnerRecurringBooking: async (recurringBookingId: string) => {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      `/bookings/recurring/cancel/${recurringBookingId}`
    );
    return response.data;
  },

  getOwnerBookingStats: async () => {
    const response = await api.get<
      ApiResponse<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        canceled: number;
      }>
    >("/bookings/stats");
    return response.data;
  },

  getStatsMetrics: async () => {
    const response = await api.get<ApiResponse<StatsMetrics>>(
      "/owner-dashboard/stats-metrics"
    );
    return response.data;
  },
};
