import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  RECURRING_STATUS_COLORS,
  RECURRING_STATUS_LABELS,
} from "@/lib/constants";
import { BookingStatus } from "@/types";

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
