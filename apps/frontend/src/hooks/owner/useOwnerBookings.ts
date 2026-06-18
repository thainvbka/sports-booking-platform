import { useState } from "react";
import { useBookingStore } from "@/store/owner/useBookingStore";
import type { OwnerBookingResponse } from "@/types";
import { toast } from "sonner";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";

export function useOwnerBookings() {
  const {
    bookings,
    stats,
    pagination,
    queryParams,
    filters,
    isLoading,
    fetchBookings,
    fetchStats,
    setFilters,
    clearFilters,
    setPage,
    confirmBooking,
    cancelBooking,
  } = useBookingStore();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    "SINGLE" | "RECURRING"
  >("SINGLE");
  const [selectedBooking, setSelectedBooking] =
    useState<OwnerBookingResponse | null>(null);

  const { searchValue, setSearchValue } = useDebouncedSearch({
    initialValue: filters.search || "",
    onSearch: (val) => setFilters({ search: val }),
    delay: 300,
  });

  useUrlPageSync({
    page: queryParams.page,
    search: filters.search,
    onInit: ({ page, search }) => {
      fetchStats();
      if (search) {
        setFilters({ search });
        if (page > 1) {
          setPage(page);
        }
      } else if (page > 1) {
        setPage(page);
      } else {
        fetchBookings();
      }
    },
  });

  const handleViewDetail = (booking: OwnerBookingResponse) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleConfirmClick = (
    bookingId: string,
    type: "SINGLE" | "RECURRING",
  ) => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setConfirmDialogOpen(true);
  };

  const handleCancelClick = (
    bookingId: string,
    type: "SINGLE" | "RECURRING",
  ) => {
    setSelectedBookingId(bookingId);
    setSelectedBookingType(type);
    setCancelDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBookingId) return;
    try {
      await confirmBooking(selectedBookingId, selectedBookingType);
      toast.success("Xác nhận đặt sân thành công");
      setConfirmDialogOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể xác nhận đặt sân";
      toast.error(message);
    }
  };

  const handleCancelAction = async () => {
    if (!selectedBookingId) return;
    try {
      await cancelBooking(selectedBookingId, selectedBookingType);
      toast.success("Hủy đặt sân thành công");
      setCancelDialogOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Không thể hủy đặt sân";
      toast.error(message);
    }
  };

  const canConfirmBooking = (booking: OwnerBookingResponse): boolean =>
    booking.status === "COMPLETED";

  const canCancelBooking = (booking: OwnerBookingResponse): boolean => {
    if (booking.status === "CANCELED") return false;
    const startTime =
      booking.type === "SINGLE" ? booking.start_time : booking.start_date;
    return new Date(startTime) > new Date();
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.dateRange ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined,
  );

  const handleClearAllFilters = () => {
    setSearchValue("");
    clearFilters();
  };

  return {
    bookings,
    stats,
    pagination,
    queryParams,
    filters,
    isLoading,
    setPage,
    setFilters,
    confirmDialogOpen,
    setConfirmDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    detailDialogOpen,
    setDetailDialogOpen,
    selectedBooking,
    searchValue,
    setSearchValue,
    handleViewDetail,
    handleConfirmClick,
    handleCancelClick,
    handleConfirmAction,
    handleCancelAction,
    canConfirmBooking,
    canCancelBooking,
    hasActiveFilters,
    handleClearAllFilters,
  };
}
