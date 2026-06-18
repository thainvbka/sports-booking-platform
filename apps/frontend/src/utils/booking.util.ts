import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
} from "@/lib/constants";
import { BookingStatus, type BookingResponse } from "@/types";

export type SingleBooking = Extract<BookingResponse, { type: "SINGLE" }>;


export const getBookingStatusColor = (
  status: string,
  fallback = "bg-muted text-muted-foreground",
): string => {
  return (
    BOOKING_STATUS_COLORS[status as BookingStatus] ||
    fallback
  );
};

export const getBookingStatusLabel = (
  status: string,
  fallback = "Không xác định",
): string => {
  return (
    BOOKING_STATUS_LABELS[status as BookingStatus] ||
    fallback
  );
};

export const getRecurringStatusColor = (
  status: string,
  fallback = "bg-muted text-muted-foreground",
): string => {
  return RECURRING_STATUS_COLORS[status] || fallback;
};

export const getRecurringStatusLabel = (
  status: string,
  fallback = "Không xác định",
): string => {
  return RECURRING_STATUS_LABELS[status] || fallback;
};

export function canCancelBooking(booking: BookingResponse): boolean {
  if (!["PENDING", "COMPLETED"].includes(booking.status)) return false;
  if (booking.type === "SINGLE") {
    return new Date(booking.start_time) > new Date();
  }
  return new Date(booking.start_date) > new Date();
}

export function canCreateReviewBooking(
  booking: BookingResponse,
): booking is SingleBooking {
  return (
    booking.type === "SINGLE" &&
    booking.status === BookingStatus.CONFIRMED &&
    !booking.review
  );
}

export function canUpdateReviewBooking(
  booking: BookingResponse,
): booking is SingleBooking {
  return (
    booking.type === "SINGLE" &&
    booking.status === BookingStatus.CONFIRMED &&
    !!booking.review
  );
}

export const toSingleBooking = (
  slot: Extract<BookingResponse, { type: "RECURRING" }>["bookings"][number],
  booking: BookingResponse,
): SingleBooking => ({
  type: "SINGLE",
  id: slot.id,
  start_time: slot.start_time,
  end_time: slot.end_time,
  total_price: slot.total_price,
  status: slot.status,
  complex_name: booking.complex_name,
  complex_address: booking.complex_address,
  sport_type: booking.sport_type,
  sub_field_name: booking.sub_field_name,
  expires_at: null,
  created_at: booking.created_at,
  review: slot.review,
  matchId: slot.matchId,
});

export const bookingStatusColor = (status: string) =>
  getBookingStatusColor(status, "bg-muted text-muted-foreground");

export const bookingStatusLabel = (status: string) =>
  getBookingStatusLabel(status, "Không xác định");


