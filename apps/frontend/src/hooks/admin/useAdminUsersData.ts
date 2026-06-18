import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUrlPageSync } from "@/hooks/useUrlPageSync";
import { useAdminUserStore } from "@/store/admin/useAdminUserStore";
import { getUserRoles } from "@/utils";
import { Shield, ShieldCheck, UserCog, Users } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export function useAdminUsersData() {
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

  const { searchValue, setSearchValue } = useDebouncedSearch({
    initialValue: filters.search || "",
    onSearch: (val) => setFilters({ search: val || undefined }),
    delay: 500,
  });

  useUrlPageSync({
    page: queryParams.page,
    search: filters.search,
    onInit: ({ page, search }) => {
      if (search) {
        setFilters({ search });
        if (page > 1) {
          setPage(page);
        }
      } else if (page > 1) {
        setPage(page);
      } else {
        fetchUsers();
      }
    },
  });

  const handleStatusUpdate = async (
    id: string,
    role: string,
    status: string,
  ) => {
    try {
      await updateUserStatus(id, role, status);
      toast.success("Cập nhật trạng thái thành công");
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      toast.error(apiError.message || "Không thể cập nhật trạng thái");
    }
  };

  const roleBreakdown = useMemo(() => {
    const counts = { PLAYER: 0, OWNER: 0, ADMIN: 0 };
    for (const u of users) {
      const r = (getUserRoles(u)[0] || "PLAYER") as keyof typeof counts;
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return counts;
  }, [users]);

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

  return {
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
    roleBreakdown,
    totalUsers,
    statItems,
  };
}
