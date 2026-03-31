import { StatsGrid } from "@/components/admin/StatsGrid";
import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPaymentStore } from "@/store/admin/useAdminPaymentStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Info,
  MapPin,
  Receipt,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export default function AdminPaymentsPage() {
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

  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        setFilters({ search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleRowClick = (payment: any) => {
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
      // variant: "solid" as const,
      description: "Tổng tiền thực thu hệ thống",
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

  const columns: Column<any>[] = [
    {
      header: "Mã giao dịch",
      className: "w-48",
      cell: (payment) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
            <Receipt className="w-3.5 h-3.5 text-primary" />
            <span>{payment.transaction_code}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-5 italic">
            Created: {format(new Date(payment.created_at), "HH:mm dd/MM")}
          </span>
        </div>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-56",
      cell: (payment) => {
        const player = payment.bookings?.[0]?.player;
        if (!player)
          return <span className="text-muted-foreground italic">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
              {player.account.full_name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[150px]">
                {player.account.full_name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {player.account.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Số tiền",
      className: "w-32",
      cell: (payment) => (
        <div className="font-bold text-sm text-foreground">
          {formatPrice(payment.amount)}
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (payment) => {
        const status = payment.status;
        return (
          <Badge
            className={`${PAYMENT_STATUS_COLORS[status]} border-none flex items-center gap-1 w-fit shadow-none text-[10px] py-0 h-5`}
          >
            {PAYMENT_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      header: "",
      className: "w-10",
      cell: () => <Info className="w-4 h-4 text-muted-foreground/50" />,
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Giám sát Thanh toán
        </h1>
        <p className="text-sm text-muted-foreground">
          Dữ liệu thống kê doanh thu toàn hệ thống.
        </p>
      </div>

      <StatsGrid items={statItems} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo Mã giao dịch, Tên khách, Email..."
            className="pl-9 h-9 shadow-none border-slate-200"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) =>
              setFilters({ status: value === "ALL" ? undefined : value })
            }
          >
            <SelectTrigger className="w-[160px] h-9 shadow-none border-slate-200">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="Không tìm thấy giao dịch nào"
      />

      {/* Detail Dialog */}
      <AdminDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Chi tiết giao dịch"
        icon={Receipt}
        statusLabel={
          selectedPayment
            ? PAYMENT_STATUS_LABELS[selectedPayment.status]
            : undefined
        }
        statusClassName={
          selectedPayment
            ? PAYMENT_STATUS_COLORS[selectedPayment.status]
            : undefined
        }
      >
        {selectedPayment && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
            <DetailSummaryRow
              leftLabel="Tổng số tiền"
              leftValue={
                <p className="text-2xl font-black text-green-700">
                  {formatPrice(selectedPayment.amount)}
                </p>
              }
              rightLabel="Mã giao dịch"
              rightValue={
                <p className="text-xs font-mono font-bold break-all text-slate-700 max-w-64">
                  {selectedPayment.transaction_code}
                </p>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailInfoCard
                label="Khách hàng"
                value={linkedBookings[0]?.player?.account?.full_name || "N/A"}
              />

              <DetailInfoCard
                label="Phương thức"
                value={selectedPayment.provider}
              />

              <DetailInfoCard
                label="Thời gian giao dịch"
                value={format(
                  new Date(selectedPayment.created_at),
                  "HH:mm - dd/MM/yyyy",
                  { locale: vi },
                )}
              />

              <DetailInfoCard
                label="Số lượt đặt liên kết"
                value={linkedBookings.length}
              />
            </div>

            {linkedBookings.length > 1 && (
              <div className="space-y-3 pt-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Các lượt đặt trong giao dịch
                </p>
                <div className="space-y-2">
                  {linkedBookings.map((booking: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-md bg-white border flex items-center justify-center font-bold text-xs text-slate-400">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {booking.sub_field?.complex?.complex_name || "N/A"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {booking.sub_field?.sub_field_name ||
                              "Unknown Field"}{" "}
                            •{" "}
                            {format(
                              new Date(booking.start_time),
                              "dd/MM HH:mm",
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold">
                        {formatPrice(booking.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDetailDialog>
    </div>
  );
}
