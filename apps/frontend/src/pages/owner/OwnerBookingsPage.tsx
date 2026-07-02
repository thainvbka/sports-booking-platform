import { BookingFilters } from "@/components/owner/booking/BookingFilters";
import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Button } from "@/components/ui/button";
import { BookingDetailDialog } from "@/components/shared/booking/BookingDetailDialog";
import { ConfirmBookingDialog } from "@/components/owner/booking/ConfirmBookingDialog";
import { CancelBookingDialog } from "@/components/owner/booking/CancelBookingDialog";
import { useOwnerBookings } from "@/hooks/owner/useOwnerBookings";
import { useBookingColumns } from "@/hooks/owner/useBookingColumns";
import { OwnerPageHero } from "@/components/owner/OwnerPageHero";
import { Badge } from "@/components/ui/badge";
import { AlarmClock, Ban, CheckCircle2, Layers, RotateCcw, Sparkles, Wallet } from "lucide-react";

export function OwnerBookingsPage() {
  const {
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
  } = useOwnerBookings();

  const columns = useBookingColumns({
    queryParams,
    onViewDetail: handleViewDetail,
    onConfirmClick: handleConfirmClick,
    onCancelClick: handleCancelClick,
    canConfirmBooking,
    canCancelBooking,
  });

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/*  HERO  */}
      <OwnerPageHero
        title={
          <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
            Quản lý lịch sử <span className="italic text-primary">đặt sân</span>
          </h1>
        }
        description={
          <p className="hidden max-w-xl text-xs text-muted-foreground md:block">
            Theo dõi, xác nhận và điều phối mọi lượt đặt — đơn lẻ lẫn định kỳ —
            từ một bảng điều khiển duy nhất.
          </p>
        }
        action={
          <Badge
            variant="outline"
            className="h-5 gap-1 rounded-full border-primary/30 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-primary"
          >
            <Sparkles className="size-2.5" />
            {pagination?.total ?? bookings.length} lịch đặt
          </Badge>
        }
        stats={[
          {
            icon: Layers,
            label: "Tổng",
            value: stats.total,
            tone: "slate",
            hint: "Tất cả lượt đặt",
          },
          {
            icon: CheckCircle2,
            label: "Đã xác nhận",
            value: stats.confirmed,
            tone: "emerald",
            hint: "Sẵn sàng đón khách",
          },
          {
            icon: AlarmClock,
            label: "Chờ xác nhận",
            value: stats.completed,
            tone: "sky",
            hint: "Cần bạn duyệt",
          },
          {
            icon: Wallet,
            label: "Chưa thanh toán",
            value: stats.pending,
            tone: "amber",
            hint: "Đang chờ ví",
          },
          {
            icon: Ban,
            label: "Đã hủy",
            value: stats.canceled,
            tone: "rose",
            hint: "Không hoạt động",
          },
        ]}
      />

      {/*  TOOLBAR  */}
      <OwnerFilterShell
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Tìm theo khách, sân, khu phức hợp…"
        searchClassName="relative w-full md:max-w-sm"
      >
        <BookingFilters
          value={filters}
          isLoading={isLoading}
          onApply={(newFilters) => setFilters(newFilters)}
          onClear={handleClearAllFilters}
        />
      </OwnerFilterShell>

      {/*  TABLE  */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-7 rounded-full px-2 text-[11px] font-semibold"
          >
            <RotateCcw data-icon="inline-start" />
            Đặt lại
          </Button>
        ) : null}
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        isLoading={isLoading}
        paginationStyle="search"
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: (page) => setPage(page),
        }}
        emptyMessage={
          hasActiveFilters
            ? "Không có lịch đặt phù hợp với bộ lọc của bạn"
            : "Chưa có lịch đặt sân nào — hãy quảng bá khu phức hợp để nhận booking đầu tiên."
        }
      />

      {/*  Detail Dialog  */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/*  Confirm Dialog  */}
      <ConfirmBookingDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmAction}
        isLoading={isLoading}
      />

      {/*  Cancel Dialog  */}
      <CancelBookingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelAction}
        isLoading={isLoading}
      />
    </div>
  );
}
