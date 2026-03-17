import type { BookingStatus, PaginationMeta } from "./index";

export interface CreateBookingData {
  start_time: string; // ISO string
  end_time: string; // ISO string
  type: "ONE_TIME" | "RECURRING";
}

export interface CreateRecurringBookingData {
  start_time: string; // ISO String
  end_time: string; // ISO String
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
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
  expires_at: string;
}

export interface SingleBookingResponse {
  type: "SINGLE";
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: BookingStatus;
  complex_name: string;
  complex_address: string;
  sport_type: string;
  sub_field_name: string;
  expires_at: string | null;
  created_at: string;
}

export interface RecurringBookingResponse {
  type: "RECURRING";
  id: string;
  recurrence_type: string;
  start_date: string;
  end_date: string;
  total_slots: number;
  total_price: number;
  status: BookingStatus;
  complex_name: string;
  complex_address: string;
  sport_type: string;
  sub_field_name: string;
  expires_at: string | null;
  created_at: string;
  bookings: {
    id: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: BookingStatus;
  }[];
}

export type BookingResponse = SingleBookingResponse | RecurringBookingResponse;

export interface BookingListResponse {
  bookings: BookingResponse[];
  pagination: PaginationMeta;
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
    id: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  expires_at: string;
}
