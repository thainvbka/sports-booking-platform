import { BookingViewFilters } from "@/components/admin/bookings/BookingViewFilters";
import { RecurringBookingDetailDialog } from "@/components/admin/bookings/RecurringBookingDetailDialog";
import { SingleBookingDetailDialog } from "@/components/admin/bookings/SingleBookingDetailDialog";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { useAdminBookingsData } from "@/hooks/admin/useAdminBookingsData";
import { useRecurringBookingColumns } from "@/hooks/admin/useRecurringBookingColumns";
import { useSingleBookingColumns } from "@/hooks/admin/useSingleBookingColumns";

export default function AdminBookingsPage() {
  const {
    activeView,
    bookings,
    singlePagination,
    singleLoading,
    singleFilters,
    singleParams,
    setSingleFilters,
    setSinglePage,

    recurringBookings,
    recurringPagination,
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
  } = useAdminBookingsData();

  const singleColumns = useSingleBookingColumns((b) => {
    setSelectedBooking(b);
    setDetailOpen(true);
  });

  const recurringColumns = useRecurringBookingColumns((rb) => {
    setSelectedRecurring(rb);
    setDetailOpen(true);
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={3}
        title="Quản lý"
        titleAccent="đặt sân"
        description="Theo dõi mọi lượt đặt sân và nhóm đặt định kỳ trên toàn hệ thống."
      />

      <StatsGrid
        items={activeView === "single" ? singleStatItems : recurringStatItems}
      />

      <BookingViewFilters
        activeView={activeView}
        onViewChange={handleViewChange}
        singleSearch={singleSearch}
        setSingleSearch={setSingleSearch}
        singleFilters={singleFilters}
        setSingleFilters={setSingleFilters}
        recurringSearch={recurringSearch}
        setRecurringSearch={setRecurringSearch}
        recurringFilters={recurringFilters}
        setRecurringFilters={setRecurringFilters}
      />

      <AdminTableSection
        index={2}
        eyebrow="Data · Table"
        title={activeView === "single" ? "Lượt đặt sân" : "Nhóm đặt định kỳ"}
        description={
          activeView === "single"
            ? "Nhấp vào một dòng để xem chi tiết lượt đặt."
            : "Nhấp vào một nhóm để xem danh sách buổi bên trong."
        }
        count={totalCount}
        countLabel={activeView === "single" ? "lượt đặt" : "nhóm"}
      >
        {activeView === "single" ? (
          <DataTable
            data={bookings}
            columns={singleColumns}
            isLoading={singleLoading}
            paginationStyle="search"
            onRowClick={(b) => {
              setSelectedBooking(b);
              setDetailOpen(true);
            }}
            pagination={{
              page: singleParams.page,
              totalPages: singlePagination?.totalPages || 1,
              onPageChange: setSinglePage,
            }}
            emptyMessage="Không tìm thấy lịch đặt sân nào"
          />
        ) : (
          <DataTable
            data={recurringBookings}
            columns={recurringColumns}
            isLoading={recurringLoading}
            paginationStyle="search"
            onRowClick={(rb) => {
              setSelectedRecurring(rb);
              setDetailOpen(true);
            }}
            pagination={{
              page: recurringParams.page,
              totalPages: recurringPagination?.totalPages || 1,
              onPageChange: setRecurringPage,
            }}
            emptyMessage="Không tìm thấy nhóm đặt định kỳ nào"
          />
        )}
      </AdminTableSection>

      <SingleBookingDetailDialog
        booking={selectedBooking}
        open={detailOpen && activeView === "single"}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedBooking(null);
        }}
      />

      <RecurringBookingDetailDialog
        recurring={selectedRecurring}
        open={detailOpen && activeView === "recurring"}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedRecurring(null);
        }}
      />
    </div>
  );
}
