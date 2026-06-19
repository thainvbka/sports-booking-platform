import { BookingFilters } from "@/components/owner/booking/BookingFilters";
import { OwnerFilterShell } from "@/components/owner/OwnerFilterShell";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Button } from "@/components/ui/button";
import { BookingsHero } from "@/components/owner/booking/BookingsHero";
import { BookingDetailDialog } from "@/components/shared/booking/BookingDetailDialog";
import { ConfirmBookingDialog } from "@/components/owner/booking/ConfirmBookingDialog";
import { CancelBookingDialog } from "@/components/owner/booking/CancelBookingDialog";
import { useOwnerBookings } from "@/hooks/owner/useOwnerBookings";
import { useBookingColumns } from "@/hooks/owner/useBookingColumns";
import { ArrowUpRight } from "lucide-react";

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
      {/* ── HERO ─────────────────────────────────────────────── */}
      <BookingsHero
        total={pagination?.total ?? bookings.length}
        stats={stats}
      />

      {/* ── TOOLBAR ──────────────────────────────────────────── */}
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

      {/* ── TABLE ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-7 rounded-full px-2 text-[11px] font-semibold"
          >
            <ArrowUpRight data-icon="inline-start" />
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

      {/* ── Detail Dialog ───────────────────────────────────── */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* ── Confirm Dialog ─────────────────────────────────── */}
      <ConfirmBookingDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmAction}
        isLoading={isLoading}
      />

      {/* ── Cancel Dialog ──────────────────────────────────── */}
      <CancelBookingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelAction}
        isLoading={isLoading}
      />
    </div>
  );
}
