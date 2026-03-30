import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ROLE_COLORS,
  ROLE_LABELS,
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
} from "@/lib/constants";
import { useAdminUserStore } from "@/store/admin/useAdminUserStore";
import type { AdminUser } from "@/types/admin.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MoreVertical, Search, User, Mail, Phone, Calendar } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const {
    users,
    pagination,
    isLoading,
    filters,
    queryParams,
    fetchUsers,
    setFilters,
    setPage,
    updateUserStatus,
  } = useAdminUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (id: string, role: string, status: string) => {
    try {
      await updateUserStatus(id, role, status);
      toast.success("Cập nhật trạng thái thành công");
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const getUserRole = (user: AdminUser) => {
    if (user.admin) return "ADMIN";
    if (user.owner) return "OWNER";
    return "PLAYER";
  };

  const getUserStatus = (user: AdminUser) => {
    if (user.admin) return user.admin.status;
    if (user.owner) return user.owner.status;
    return user.player?.status || "ACTIVE";
  };

  const columns: Column<AdminUser>[] = [
    {
      header: "STT",
      className: "w-16",
      cell: (_, index) => (
        <span className="text-muted-foreground font-medium">
          {(queryParams.page - 1) * queryParams.limit + index + 1}
        </span>
      ),
    },
    {
      header: "Người dùng",
      className: "w-64",
      cell: (user) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2 font-semibold">
            <User className="w-4 h-4 text-primary" />
            <span>{user.full_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{user.phone_number}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Vai trò",
      className: "w-32",
      cell: (user) => {
        const role = getUserRole(user);
        return (
          <Badge variant="secondary" className={ROLE_COLORS[role]}>
            {ROLE_LABELS[role]}
          </Badge>
        );
      },
    },
    {
      header: "Trạng thái",
      className: "w-40",
      cell: (user) => {
        const status = getUserStatus(user);
        return (
          <Badge className={USER_STATUS_COLORS[status]}>
            {USER_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      header: "Ngày tham gia",
      className: "w-40",
      cell: (user) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(user.created_at), "dd/MM/yyyy", { locale: vi })}</span>
        </div>
      ),
    },
    {
      header: "Hành động",
      className: "w-16",
      cell: (user) => {
        const role = getUserRole(user);
        const status = getUserStatus(user);
        
        if (role === "ADMIN") return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {status !== "ACTIVE" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, role, "ACTIVE")}>
                  Kích hoạt
                </DropdownMenuItem>
              )}
              {status !== "INACTIVE" && status !== "BANNED" && status !== "SUSPENDED" && (
                <DropdownMenuItem 
                  onClick={() => handleStatusUpdate(user.id, role, role === "OWNER" ? "SUSPENDED" : "INACTIVE")}
                  className="text-red-600"
                >
                  {role === "OWNER" ? "Tạm đình chỉ" : "Khóa tài khoản"}
                </DropdownMenuItem>
              )}
              {role === "OWNER" && status === "PENDING" && (
                <DropdownMenuItem 
                  onClick={() => handleStatusUpdate(user.id, role, "REJECTED")}
                  className="text-red-600"
                >
                  Từ chối duyệt
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, sđt..."
            className="pl-9"
            defaultValue={filters.search}
            onChange={(e) => {
                const timer = setTimeout(() => {
                    setFilters({ search: e.target.value });
                }, 500);
                return () => clearTimeout(timer);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.role || "ALL"}
            onValueChange={(value) => setFilters({ role: value === "ALL" ? undefined : value })}
          >
            <SelectTrigger className="w-[160px]">
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
            onValueChange={(value) => setFilters({ status: value === "ALL" ? undefined : value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Bị khóa</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          page: queryParams.page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="Không tìm thấy người dùng nào"
      />
    </div>
  );
}
