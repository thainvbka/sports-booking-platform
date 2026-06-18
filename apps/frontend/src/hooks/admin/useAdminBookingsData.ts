import { useAdminBookingStore } from "@/store/admin/useAdminBookingStore";
import { useAdminRecurringBookingStore } from "@/store/admin/useAdminRecurringBookingStore";
import {
  CalendarRange,
  Clock,
  LayoutDashboard,
  Repeat2,
  Timer,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { AdminBookingRow, AdminRecurringRow, BookingView } from "@/types/admin.types";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";

export function useAdminBookingsData() {
  const [activeView, setActiveView] = useState<BookingView>("single");
  const [recurringInitialized, setRecurringInitialized] = useState(false);

  const {
    bookings,
    pagination: singlePagination,
    stats: singleStats,
    isLoading: singleLoading,
    filters: singleFilters,
    queryParams: singleParams,
    fetchBookings,
    setFilters: setSingleFilters,
    setPage: setSinglePage,
  } = useAdminBookingStore();

  const {
    recurringBookings,
    pagination: recurringPagination,
    stats: recurringStats,
    isLoading: recurringLoading,
    filters: recurringFilters,
    queryParams: recurringParams,
    fetchRecurringBookings,
    setFilters: setRecurringFilters,
    setPage: setRecurringPage,
  } = useAdminRecurringBookingStore();

  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingRow | null>(null);
  const [selectedRecurring, setSelectedRecurring] =
    useState<AdminRecurringRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { searchValue: singleSearch, setSearchValue: setSingleSearch } = useDebouncedSearch({
    initialValue: singleFilters.search || "",
    onSearch: (val) => setSingleFilters({ search: val || undefined }),
    delay: 500,
  });

  const { searchValue: recurringSearch, setSearchValue: setRecurringSearch } = useDebouncedSearch({
    initialValue: recurringFilters.search || "",
    onSearch: (val) => setRecurringFilters({ search: val || undefined }),
    delay: 500,
  });

  useUrlPageSync({
    page: activeView === "single" ? singleParams.page : recurringParams.page,
    search: activeView === "single" ? singleFilters.search : recurringFilters.search,
    onInit: ({ page, search }) => {
      if (activeView === "single") {
        if (search) {
          setSingleFilters({ search });
          if (page > 1) {
            setSinglePage(page);
          }
        } else if (page > 1) {
          setSinglePage(page);
        } else {
          fetchBookings();
        }
      } else {
        if (search) {
          setRecurringFilters({ search });
          if (page > 1) {
            setRecurringPage(page);
          }
        } else if (page > 1) {
          setRecurringPage(page);
        } else {
          fetchRecurringBookings();
        }
      }
    },
  });

  const handleViewChange = (view: BookingView) => {
    setActiveView(view);
    if (view === "recurring" && !recurringInitialized) {
      fetchRecurringBookings();
      setRecurringInitialized(true);
    }
  };

  const singleStatItems = [
    {
      label: "Tổng đặt đơn lẻ",
      value: singleStats.total,
      icon: LayoutDashboard,
      color: "blue" as const,
    },
    {
      label: "Chưa thanh toán",
      value: singleStats.pending,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Chờ xác nhận",
      value: singleStats.completed,
      icon: Timer,
      color: "indigo" as const,
    },
    {
      label: "Đã hủy",
      value: singleStats.canceled,
      icon: XCircle,
      color: "red" as const,
    },
  ];

  const recurringStatItems = [
    {
      label: "Tổng nhóm định kỳ",
      value: recurringStats.total,
      icon: Repeat2,
      color: "purple" as const,
    },
    {
      label: "Chưa thanh toán",
      value: recurringStats.pending,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Đã xác nhận",
      value: recurringStats.confirmed,
      icon: CalendarRange,
      color: "green" as const,
    },
    {
      label: "Đã hủy",
      value: recurringStats.canceled,
      icon: XCircle,
      color: "red" as const,
    },
  ];

  const totalCount =
    activeView === "single"
      ? singlePagination?.total ?? singleStats.total
      : recurringPagination?.total ?? recurringStats.total;

  return {
    activeView,
    recurringInitialized,
    bookings,
    singlePagination,
    singleStats,
    singleLoading,
    singleFilters,
    singleParams,
    setSingleFilters,
    setSinglePage,

    recurringBookings,
    recurringPagination,
    recurringStats,
    recurringLoading,
    recurringFilters,
    recurringParams,
    setRecurringFilters,
    setRecurringPage,

    singleSearch,
    setSingleSearch,
    recurringSearch,
    setRecurringSearch,
    selectedBooking,
    setSelectedBooking,
    selectedRecurring,
    setSelectedRecurring,
    detailOpen,
    setDetailOpen,

    handleViewChange,
    singleStatItems,
    recurringStatItems,
    totalCount,
  };
}
