import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";
import { useAdminPaymentStore } from "@/store/admin/useAdminPaymentStore";
import type { AdminPayment } from "@/types/admin.types";
import { formatPrice } from "@/utils";
import { AlertCircle, ArrowRightLeft, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";

export function useAdminPaymentsData() {
  const {
    payments,
    pagination,
    stats,
    isLoading,
    filters,
    queryParams,
    fetchPayments,
    setFilters,
    setPage,
  } = useAdminPaymentStore();

  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const { searchValue, setSearchValue } = useDebouncedSearch({
    initialValue: filters.search || "",
    onSearch: (val) => setFilters({ search: val || undefined }),
    delay: 500,
  });

  useUrlPageSync({
    page: queryParams.page,
    search: filters.search,
    onInit: ({ page, search }) => {
      if (search) {
        setFilters({ search });
        if (page > 1) {
          setPage(page);
        }
      } else if (page > 1) {
        setPage(page);
      } else {
        fetchPayments();
      }
    },
  });

  const handleRowClick = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  const linkedBookings = selectedPayment?.bookings || [];

  const statItems = [
    {
      label: "Tổng doanh thu",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: "slate" as const,
    },
    {
      label: "Chờ thanh toán",
      value: stats.pendingCount,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Giao dịch thành công",
      value: stats.successCount,
      icon: CheckCircle2,
      color: "green" as const,
    },
    {
      label: "Giao dịch lỗi",
      value: stats.failedCount,
      icon: AlertCircle,
      color: "red" as const,
    },
    {
      label: "Đã hoàn tiền",
      value: stats.refundedCount,
      icon: ArrowRightLeft,
      color: "purple" as const,
    },
  ];

  const totalCount =
    pagination?.total ??
    stats.successCount + stats.failedCount + stats.refundedCount + stats.pendingCount;

  return {
    payments: payments as AdminPayment[],
    pagination,
    isLoading,
    filters,
    queryParams,
    setFilters,
    setPage,
    searchValue,
    setSearchValue,
    selectedPayment,
    setSelectedPayment,
    detailOpen,
    setDetailOpen,
    handleRowClick,
    linkedBookings,
    statItems,
    totalCount,
  };
}
