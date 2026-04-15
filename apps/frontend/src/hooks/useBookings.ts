import { bookingService } from "@/services/booking.service";
import { type BookingResponse, type BookingReviewSummary, BookingStatus } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface UseBookingsOptions {
  pageSize?: number;
}

interface UseBookingsResult {
  bookings: BookingResponse[];
  loading: boolean;
  page: number;
  totalPages: number;
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

const DEFAULT_PAGE_SIZE = 8;

export function useBookings({
  pageSize = DEFAULT_PAGE_SIZE,
}: UseBookingsOptions = {}): UseBookingsResult {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);

    try {
      const res = await bookingService.getAllBookings(page, pageSize);
      setBookings(res.data.bookings || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Đã xảy ra lỗi khi tải lịch đặt sân");
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

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
        previousBookings.map((booking) =>
          booking.type === "SINGLE" && booking.id === bookingId
            ? { ...booking, review }
            : booking,
        ),
      );
    },
    [],
  );

  return {
    bookings,
    loading,
    page,
    totalPages,
    setPage,
    updateBookingStatus,
    updateSingleBookingReview,
  };
}