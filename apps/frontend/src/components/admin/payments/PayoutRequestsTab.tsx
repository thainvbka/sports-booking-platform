import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePayoutBatchColumns } from "@/hooks/admin/usePayoutBatchColumns";
import type { AdminPayoutBatchRecord } from "@/types";

interface PayoutRequestsTabProps {
  filteredBatches: AdminPayoutBatchRecord[];
  isLoading: boolean;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRowClick: (batch: AdminPayoutBatchRecord) => void;
}

export function PayoutRequestsTab({
  filteredBatches,
  isLoading,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  onRowClick,
}: PayoutRequestsTabProps) {
  const columns = usePayoutBatchColumns({
    onViewDetail: onRowClick,
  });

  return (
    <>
      <AdminFiltersBar>
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo chủ sân, ngân hàng, STK thụ hưởng..."
            className="h-9 pl-3 text-xs rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px] rounded-xl text-xs">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="REQUESTED">Chờ duyệt</SelectItem>
            <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
            <SelectItem value="PAID">Đã quyết toán</SelectItem>
            <SelectItem value="CANCELLED">Đã từ chối</SelectItem>
          </SelectContent>
        </Select>
      </AdminFiltersBar>

      <AdminTableSection
        index={5}
        eyebrow="Payout · Settlement"
        title="Bảng đối soát chi trả"
        description="Nhấp vào bất kỳ dòng nào trên bảng để xem chi tiết đối soát chứng từ và duyệt đợt thanh toán."
        count={filteredBatches.length}
        countLabel="đợt chi trả"
      >
        <DataTable
          data={filteredBatches}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          onRowClick={onRowClick}
          pagination={{
            page: 1,
            totalPages: 1,
            onPageChange: () => {},
          }}
          emptyMessage="Không tìm thấy yêu cầu chi trả nào phù hợp"
        />
      </AdminTableSection>
    </>
  );
}
