import { PaymentDetailDialog } from "@/components/admin/payments/PaymentDetailDialog";
import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_STATUS_LABELS } from "@/constants";
import { useAdminPaymentsData } from "@/hooks/admin/useAdminPaymentsData";
import { usePaymentColumns } from "@/hooks/admin/usePaymentColumns";
import { Search } from "lucide-react";

export default function AdminPaymentsPage() {
  const {
    payments,
    pagination,
    isLoading,
    filters,
    queryParams,
    setFilters,
    setPage,
    searchValue,
    setSearchValue,
    selectedPayment,
    detailOpen,
    setDetailOpen,
    handleRowClick,
    statItems,
    totalCount,
  } = useAdminPaymentsData();

  const columns = usePaymentColumns({
    onViewDetail: (payment) => {
      handleRowClick(payment);
    },
  });

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
        title="Sổ giao dịch"
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

      <PaymentDetailDialog
        payment={selectedPayment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
