import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CreditCard,
  Eye,
  MapPin,
  MoreHorizontal,
  Receipt,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-rose-500/15 dark:text-rose-300",
  REFUNDED: "bg-blue-100 text-blue-800 dark:bg-sky-500/15 dark:text-sky-300",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        setFilters({ search: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

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
            <Receipt className="size-3.5 text-primary" />
            <span className="truncate">{payment.transaction_code}</span>
          </div>
          <span className="ml-5 text-[10px] italic text-muted-foreground">
            {format(new Date(payment.created_at), "HH:mm · dd/MM", {
              locale: vi,
            })}
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
          return <span className="italic text-muted-foreground">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-primary/5 text-[11px] font-bold text-primary">
              {player.account.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {player.account.full_name}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {player.account.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Phương thức",
      className: "w-36",
      cell: (payment) => (
        <div className="flex items-center gap-1.5 text-xs">
          <CreditCard className="size-3.5 text-sky-500" />
          <span className="font-medium uppercase tracking-wide">
            {payment.provider}
          </span>
        </div>
      ),
    },
    {
      header: "Số tiền",
      className: "w-32",
      cell: (payment) => (
        <div className="font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
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
            className={`${PAYMENT_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"} h-5 w-fit border-none py-0 text-[10px] shadow-none`}
          >
            {PAYMENT_STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPayment(payment);
                  setDetailOpen(true);
                }}
              >
                <Eye /> Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalCount =
    pagination?.total ??
    stats.successCount + stats.failedCount + stats.refundedCount;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={4}
        title="Quản lý"
        titleAccent="thanh toán"
        description="Theo dõi dòng tiền, đối soát giao dịch và kiểm tra lịch sử hoàn tiền trên toàn hệ thống."
      />

      <StatsGrid items={statItems} />

      <AdminFiltersBar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã giao dịch, tên khách, email..."
            className="h-9 pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) =>
            setFilters({ status: value === "ALL" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
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
      </AdminFiltersBar>

      <AdminTableSection
        index={4}
        eyebrow="Data · Ledger"
        title="Sổ cái giao dịch"
        description="Nhấp vào một dòng để xem chi tiết và các lượt đặt liên kết."
        count={totalCount}
        countLabel="giao dịch"
      >
        <DataTable
          data={payments}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          onRowClick={handleRowClick}
          pagination={{
            page: queryParams.page,
            totalPages: pagination?.totalPages || 1,
            onPageChange: setPage,
          }}
          emptyMessage="Không tìm thấy giao dịch nào"
        />
      </AdminTableSection>

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
          <div className="max-h-[70vh] space-y-6 overflow-y-auto bg-background p-6">
            <DetailSummaryRow
              leftLabel="Tổng số tiền"
              leftValue={
                <p className="font-display text-2xl font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatPrice(selectedPayment.amount)}
                </p>
              }
              rightLabel="Mã giao dịch"
              rightValue={
                <p className="max-w-64 break-all font-mono text-xs font-bold text-foreground">
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
                  "HH:mm · dd/MM/yyyy",
                  { locale: vi },
                )}
              />
              <DetailInfoCard
                label="Số lượt đặt liên kết"
                value={linkedBookings.length}
              />
            </div>

            {linkedBookings.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Các lượt đặt trong giao dịch ({linkedBookings.length})
                </p>
                <div className="space-y-2">
                  {linkedBookings.map((booking: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-background text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="flex items-center gap-1 text-sm font-bold">
                            <MapPin className="size-3 text-rose-500" />
                            {booking.sub_field?.complex?.complex_name || "N/A"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {booking.sub_field?.sub_field_name ||
                              "Unknown Field"}{" "}
                            ·{" "}
                            {format(
                              new Date(booking.start_time),
                              "dd/MM HH:mm",
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="font-display text-sm font-black italic tracking-tight text-foreground">
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
