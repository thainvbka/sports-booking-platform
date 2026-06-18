import { AdminFiltersBar } from "@/components/admin/shell/AdminFiltersBar";
import { AdminTableSection } from "@/components/admin/shell/AdminTableSection";
import { DataTable } from "@/components/shared/ui-utility/DataTable";
import { Input } from "@/components/ui/input";
import { useOwnerWalletColumns } from "@/hooks/admin/useOwnerWalletColumns";
import type { AdminOwnerWalletRecord } from "@/services/payout.service";

interface OwnerWalletsTabProps {
  filteredWallets: AdminOwnerWalletRecord[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function OwnerWalletsTab({
  filteredWallets,
  isLoading,
  searchTerm,
  setSearchTerm,
}: OwnerWalletsTabProps) {
  const columns = useOwnerWalletColumns();

  return (
    <>
      <AdminFiltersBar>
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo tên chủ sân, email, ngân hàng, STK..."
            className="h-9 pl-3 text-xs rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </AdminFiltersBar>

      <AdminTableSection
        index={5}
        eyebrow="Owners · Wallets"
        title="Bảng tổng quan ví & số dư chủ sân"
        description="Theo dõi toàn bộ số dư tích lũy chưa quyết toán (nợ đọng), đang yêu cầu rút, và lũy kế đã trả của từng chủ sân."
        count={filteredWallets.length}
        countLabel="chủ sân"
      >
        <DataTable
          data={filteredWallets}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          pagination={{
            page: 1,
            totalPages: 1,
            onPageChange: () => {},
          }}
          emptyMessage="Không tìm thấy ví chủ sân nào phù hợp"
        />
      </AdminTableSection>
    </>
  );
}
