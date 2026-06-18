import { bookingService } from "@/services/booking.service";
import { type BookingResponse, type BookingReviewSummary, BookingStatus } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface UseBookingsOptions {
  pageSize?: number;
  status?: BookingStatus | "ALL";
}

interface UseBookingsResult {
  bookings: BookingResponse[];
  loading: boolean;
  page: number;
  totalPages: number;
  summary: {
    total: number;
    byStatus: Record<BookingStatus, number>;
  };
  setPage: (nextPage: number) => void;
  updateBookingStatus: (
    bookingId: string,
    bookingType: "SINGLE" | "RECURRING",
    status: BookingStatus,
  ) => void;
  updateSingleBookingReview: (
    bookingId: string,
    review: BookingReviewSummary,
  ) => void;
}

const DEFAULT_PAGE_SIZE = 9;

export function useBookings({
  pageSize = DEFAULT_PAGE_SIZE,
  status = "ALL",
}: UseBookingsOptions = {}): UseBookingsResult {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<UseBookingsResult["summary"]>({
    total: 0,
    byStatus: {
      [BookingStatus.PENDING]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.COMPLETED]: 0,
      [BookingStatus.CANCELED]: 0,
    },
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const fetchBookings = useCallback(async () => {
    // Check and restore original booking expiry for abandoned checkout sessions (e.g. browser Back button)
    await bookingService.recoverPendingCheckout();

    setLoading(true);

    try {
      const effectiveStatus = status === "ALL" ? undefined : status;
      const res = await bookingService.getAllBookings(
        page,
        pageSize,
        effectiveStatus,
      );
      setBookings(res.data.bookings || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setSummary({
        total: res.data.summary?.total ?? 0,
        byStatus: {
          [BookingStatus.PENDING]:
            res.data.summary?.by_status?.[BookingStatus.PENDING] ?? 0,
          [BookingStatus.CONFIRMED]:
            res.data.summary?.by_status?.[BookingStatus.CONFIRMED] ?? 0,
          [BookingStatus.COMPLETED]:
            res.data.summary?.by_status?.[BookingStatus.COMPLETED] ?? 0,
          [BookingStatus.CANCELED]:
            res.data.summary?.by_status?.[BookingStatus.CANCELED] ?? 0,
        },
      });
    } catch {
      toast.error("Đã xảy ra lỗi khi tải lịch đặt sân");
      setBookings([]);
      setTotalPages(1);
      setSummary({
        total: 0,
        byStatus: {
          [BookingStatus.PENDING]: 0,
          [BookingStatus.CONFIRMED]: 0,
          [BookingStatus.COMPLETED]: 0,
          [BookingStatus.CANCELED]: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    const normalizedPage = Number.isNaN(urlPage) || urlPage < 1 ? 1 : urlPage;

    setPageState((currentPage) =>
      currentPage === normalizedPage ? currentPage : normalizedPage,
    );
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();

    const params = new URLSearchParams();
    if (page > 1) {
      params.set("page", String(page));
    }
    setSearchParams(params);
  }, [fetchBookings, page, setSearchParams]);

  const updateBookingStatus = useCallback(
    (
      bookingId: string,
      bookingType: "SINGLE" | "RECURRING",
      status: BookingStatus,
    ) => {
      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId && booking.type === bookingType
            ? { ...booking, status }
            : booking,
        ),
      );
    },
    [],
  );

  const updateSingleBookingReview = useCallback(
    (bookingId: string, review: BookingReviewSummary) => {
      setBookings((previousBookings) =>
        previousBookings.map((booking) => {
          if (booking.type === "SINGLE" && booking.id === bookingId) {
            return { ...booking, review };
          }
          if (booking.type === "RECURRING") {
            const hasSubBooking = booking.bookings.some((b) => b.id === bookingId);
            if (hasSubBooking) {
              return {
                ...booking,
                bookings: booking.bookings.map((b) =>
                  b.id === bookingId ? { ...b, review } : b
                ),
              };
            }
          }
          return booking;
        }),
      );
    },
    [],
  );

  return {
    bookings,
    loading,
    page,
    totalPages,
    summary,
    setPage,
    updateBookingStatus,
    updateSingleBookingReview,
  };
}