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
import {
  ROLE_COLORS,
  ROLE_LABELS,
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
} from "@/lib/constants";
import { useAdminUserStore } from "@/store/admin/useAdminUserStore";
import type { AdminUser } from "@/types/admin.types";
import { formatDateVn } from "@/utils";
import {
  Ban,
  Calendar,
  CheckCircle,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  User,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

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

  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    if (debouncedSearchValue !== (filters.search || "")) {
      setFilters({ search: debouncedSearchValue });
    }
  }, [debouncedSearchValue, filters.search, setFilters]);

  const handleStatusUpdate = async (
    id: string,
    role: string,
    status: string,
  ) => {
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

  const initials = (name?: string) =>
    (name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

  const roleBreakdown = useMemo(() => {
    const counts = { PLAYER: 0, OWNER: 0, ADMIN: 0 };
    for (const u of users) {
      const r = getUserRole(u) as keyof typeof counts;
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return counts;
  }, [users]);

  const columns: Column<AdminUser>[] = [
    {
      header: "STT",
      className: "w-14",
      cell: (_, index) => (
        <span className="font-mono text-[11px] font-semibold text-muted-foreground tabular-nums">
          {String(
            (queryParams.page - 1) * queryParams.limit + index + 1,
          ).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "Người dùng",
      className: "w-72",
      cell: (user) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary/5 font-display text-xs font-black italic text-primary">
            {initials(user.full_name)}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <User className="size-3.5 text-primary" />
              <span className="truncate">{user.full_name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Mail className="size-3" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Phone className="size-3" />
              <span>{user.phone_number}</span>
            </div>
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
          <Badge
            variant="secondary"
            className={`${ROLE_COLORS[role]} h-5 border-none py-0 text-[10px] shadow-none`}
          >
            {ROLE_LABELS[role]}
          </Badge>
        );
      },
    },
    {
      header: "Trạng thái",
      className: "w-36",
      cell: (user) => {
        const status = getUserStatus(user);
        return (
          <Badge
            className={`${USER_STATUS_COLORS[status]} h-5 border-none py-0 text-[10px] shadow-none`}
          >
            {USER_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      header: "Ngày tham gia",
      className: "w-40",
      cell: (user) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>
            {formatDateVn(user.created_at, "dd/MM/yyyy")}
          </span>
        </div>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (user) => {
        const role = getUserRole(user);
        const status = getUserStatus(user);

        if (role === "ADMIN") {
          return (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-40"
              disabled
            >
              <MoreHorizontal />
              <span className="sr-only">Không có hành động</span>
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal />
                <span className="sr-only">Mở menu hành động</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {status !== "ACTIVE" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(user.id, role, "ACTIVE")}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle /> Kích hoạt
                  </DropdownMenuItem>
                )}
                {status !== "INACTIVE" &&
                  status !== "BANNED" &&
                  status !== "SUSPENDED" && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleStatusUpdate(
                          user.id,
                          role,
                          role === "OWNER" ? "SUSPENDED" : "INACTIVE",
                        )
                      }
                      className="text-rose-600 dark:text-rose-400"
                    >
                      <Ban />
                      {role === "OWNER" ? "Tạm đình chỉ" : "Khóa tài khoản"}
                    </DropdownMenuItem>
                  )}
                {role === "OWNER" && status === "PENDING" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(user.id, role, "REJECTED")}
                    className="text-rose-600 dark:text-rose-400"
                  >
                    <XCircle /> Từ chối duyệt
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const totalUsers = pagination?.total ?? users.length;
  const statItems = [
    {
      label: "Tổng người dùng",
      value: totalUsers,
      icon: Users,
      color: "blue" as const,
    },
    {
      label: "Người chơi",
      value: roleBreakdown.PLAYER,
      icon: ShieldCheck,
      color: "green" as const,
    },
    {
      label: "Chủ sân",
      value: roleBreakdown.OWNER,
      icon: UserCog,
      color: "purple" as const,
    },
    {
      label: "Quản trị",
      value: roleBreakdown.ADMIN,
      icon: Shield,
      color: "red" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={1}
        // eyebrow="Admin · Identity"
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
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[160px]">
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
          <SelectTrigger className="h-9 w-full shrink-0 md:w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Bị khóa</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
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
