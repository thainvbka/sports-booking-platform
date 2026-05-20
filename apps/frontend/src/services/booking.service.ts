import { api } from "@/lib/axios";
import type {
  ApiResponse,
  BookingListResponse,
  BookingReviewResponse,
  BookingStatus,
  CreateBookingData,
  CreateRecurringBookingData,
  RecurringBookingReviewResponse,
} from "@/types";

export const bookingService = {
  createBooking: async (subFieldId: string, data: CreateBookingData) => {
    const response = await api.post<ApiResponse<{ booking: { id: string } }>>(
      `/bookings/${subFieldId}`,
      data,
    );
    return response.data;
  },

  createRecurringBooking: async (
    subFieldId: string,
    data: CreateRecurringBookingData,
  ) => {
    const response = await api.post<
      ApiResponse<{ recurringBooking: { id: string } }>
    >(`/bookings/recurring/${subFieldId}`, data);
    return response.data;
  },

  reviewBooking: async (bookingId: string) => {
    const response = await api.get<
      ApiResponse<{ booking: BookingReviewResponse }>
    >(`/bookings/review/${bookingId}`);
    return response.data;
  },

  reviewRecurringBooking: async (bookingId: string) => {
    const response = await api.get<
      ApiResponse<{ recurringBooking: RecurringBookingReviewResponse }>
    >(`/bookings/recurring/review/${bookingId}`);
    return response.data;
  },

  getAllBookings: async (
    page: number = 1,
    limit: number = 9,
    status?: BookingStatus,
  ) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) {
      searchParams.set("status", status);
    }
    const response = await api.get<ApiResponse<BookingListResponse>>(
      `/bookings?${searchParams.toString()}`,
    );
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.patch<ApiResponse<null>>(
      `/bookings/${bookingId}`,
    );
    return response.data;
  },

  cancelRecurringBooking: async (recurringBookingId: string) => {
    const response = await api.patch<ApiResponse<null>>(
      `/bookings/recurring/${recurringBookingId}`,
    );
    return response.data;
  },

  createCheckoutSession: async (bookingIds: string[]) => {
    const response = await api.post<ApiResponse<{ url: string }>>(
      `/payments/checkout-session`,
      {
        booking_ids: bookingIds,
      },
    );
    return response.data;
  },

  createVnpayCheckoutSession: async (bookingIds: string[]) => {
    const response = await api.post<ApiResponse<{ url: string }>>(
      `/payments/vnpay/checkout-session`,
      {
        booking_ids: bookingIds,
      },
    );
    return response.data;
  },

  verifyVnpayPayment: async (queryString: string) => {
    const response = await api.get<{ RspCode: string; Message: string }>(
      `/payments/vnpay/ipn${queryString}`,
    );
    return response.data;
  },
};
