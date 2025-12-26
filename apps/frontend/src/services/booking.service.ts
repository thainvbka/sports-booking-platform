import { api as axiosInstance } from "@/lib/axios";

// Types based on the backend schemas/responses
export interface CreateBookingData {
  start_time: string; // ISO string
  end_time: string;   // ISO string
  type: "ONE_TIME" | "RECURRING";
}

export interface CreateRecurringBookingData {
  start_time: string; // ISO String (Full date, but backend extracts time)
  end_time: string;   // ISO String
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  recurring_type: "WEEKLY" | "MONTHLY";
  type: "RECURRING";
}

export interface BookingReviewResponse {
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  complex_name: string;
  complex_address: string;
  sport_type: string;
  sub_field_name: string;
}

export interface RecurringBookingReviewResponse {
  id: string;
  complex_name: string;
  complex_address: string;
  sub_field_name: string;
  sport_type: string;
  start_date: string;
  end_date: string;
  recurrence_type: string;
  total_slots: number;
  total_price: number;
  slots: {
    date: string;
    price: number;
  }[];
  expires_at: string;
}

export const bookingService = {
  // Service to handle booking API calls
  createBooking: async (subFieldId: string, data: CreateBookingData) => {
    const response = await axiosInstance.post(
      `/bookings/${subFieldId}`,
      data
    );
    // Backend returns { data: { booking: { id: ... } } }
    const booking = response.data.data.booking;
    return {
        booking_id: booking.id,
        ...booking
    };
  },

  createRecurringBooking: async (
    subFieldId: string,
    data: CreateRecurringBookingData
  ) => {
    const response = await axiosInstance.post(
      `/bookings/recurring/${subFieldId}`,
      data
    );
    const recurringBooking = response.data.data.recurringBooking;
    return {
        recurring_booking_id: recurringBooking.id,
        ...recurringBooking
    };
  },

  reviewBooking: async (bookingId: string) => {
    const response = await axiosInstance.get(
      `/bookings/review/${bookingId}`
    );
    return response.data.data.booking;
  },

  reviewRecurringBooking: async (bookingId: string) => {
    const response = await axiosInstance.get(
      `/bookings/recurring/review/${bookingId}`
    );
    // The controller returns 'result' in data, looking at controller it probably is just the object directly or nested?
    // Let's check reviewRecurringBookingController in step 296:
    // data: result
    // And result comes from reviewRecurringBookingService.
    // Let's assume it returns the object directly in data if it's not wrapped in a key like 'recurringBooking'.
    // Wait, create used 'data: { recurringBooking }'.
    // reviewRecurringBookingController uses 'data: result'.
    // result from service is an object.
    // So it's response.data.data
    return response.data.data;
  },
};
