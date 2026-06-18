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
import { COMPLEX_STATUS_LABELS } from "@/lib/constants";
import { ComplexDetailDialog } from "@/components/admin/complexes/ComplexDetailDialog";
import { useComplexColumns } from "@/hooks/admin/useComplexColumns";
import { useAdminComplexesData } from "@/hooks/admin/useAdminComplexesData";
import { Search } from "lucide-react";

export default function AdminComplexesPage() {
  const {
    complexes,
    pagination,
    isLoading,
    filters,
    queryParams,
    setFilters,
    setPage,
    searchValue,
    setSearchValue,
    selectedComplex,
    docDialogOpen,
    setDocDialogOpen,
    handleStatusUpdate,
    openComplexDetail,
    statItems,
    totalComplexes,
    selectedComplexDocUrls,
  } = useAdminComplexesData();

  const columns = useComplexColumns({
    onViewDetail: openComplexDetail,
    onStatusUpdate: handleStatusUpdate,
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={2}
        title="Quản lý"
        titleAccent="khu phức hợp"
        description="Duyệt khu phức hợp thể thao đăng ký mới và điều phối trạng thái vận hành của toàn mạng lưới."
      />

      <StatsGrid items={statItems} />

      <AdminFiltersBar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên khu phức hợp, chủ sở hữu..."
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
            {Object.entries(COMPLEX_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminFiltersBar>

      <AdminTableSection
        index={3}
        eyebrow="Data · Table"
        title="Danh mục khu phức hợp"
        description="Nhấp vào một dòng để xem hồ sơ pháp lý và phê duyệt."
        count={totalComplexes}
        countLabel="khu"
      >
        <DataTable
          data={complexes}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          onRowClick={(complex) => openComplexDetail(complex)}
          pagination={{
            page: queryParams.page,
            totalPages: pagination?.totalPages || 1,
            onPageChange: setPage,
          }}
          emptyMessage="Không tìm thấy khu phức hợp nào"
        />
      </AdminTableSection>

      <ComplexDetailDialog
        complex={selectedComplex}
        open={docDialogOpen}
        onOpenChange={setDocDialogOpen}
        onStatusUpdate={handleStatusUpdate}
        docUrls={selectedComplexDocUrls}
      />
    </div>
  );
}
