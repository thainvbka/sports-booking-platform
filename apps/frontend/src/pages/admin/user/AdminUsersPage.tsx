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
import { useAdminUsersData } from "@/hooks/admin/useAdminUsersData";
import { useUserColumns } from "@/hooks/admin/useUserColumns";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const {
    users,
    pagination,
    isLoading,
    filters,
    queryParams,
    setFilters,
    setPage,
    searchValue,
    setSearchValue,
    handleStatusUpdate,
    totalUsers,
    statItems,
  } = useAdminUsersData();

  const columns = useUserColumns({
    page: queryParams.page,
    limit: queryParams.limit,
    onStatusUpdate: handleStatusUpdate,
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={1}
        title="Quản lý"
        titleAccent="người dùng"
        description="Kiểm soát danh tính, vai trò và trạng thái hoạt động của người chơi, chủ sân và quản trị viên."
      />

      <StatsGrid items={statItems} />

      <AdminFiltersBar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="h-9 pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Select
          value={filters.role || "ALL"}
          onValueChange={(value) =>
            setFilters({ role: value === "ALL" ? undefined : value })
          }
        >
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[180px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả vai trò</SelectItem>
            <SelectItem value="PLAYER">Người chơi</SelectItem>
            <SelectItem value="OWNER">Chủ sân</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
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
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Bị khóa</SelectItem>
          </SelectContent>
        </Select>
      </AdminFiltersBar>

      <AdminTableSection
        index={5}
        eyebrow="Data · Directory"
        title="Danh bạ người dùng"
        description="Nhấp vào biểu tượng hành động để thay đổi trạng thái tài khoản."
        count={totalUsers}
        countLabel="tài khoản"
      >
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          paginationStyle="search"
          pagination={{
            page: queryParams.page,
            totalPages: pagination?.totalPages || 1,
            onPageChange: setPage,
          }}
          emptyMessage="Không tìm thấy người dùng nào"
        />
      </AdminTableSection>
    </div>
  );
}
