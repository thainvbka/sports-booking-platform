import { UserActionsMenu } from "@/components/admin/users/UserActionsMenu";
import { UserCell } from "@/components/admin/users/UserCell";
import type { Column } from "@/components/shared/ui-utility/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  ROLE_COLORS,
  ROLE_LABELS,
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
} from "@/constants";
import type { AdminUser } from "@/types/admin.types";
import { formatDateVn, getUserRoles, getUserStatus } from "@/utils";
import { Calendar } from "lucide-react";

interface UseUserColumnsProps {
  page: number;
  limit: number;
  onStatusUpdate: (id: string, role: string, status: string) => void;
}

export function useUserColumns({
  page,
  limit,
  onStatusUpdate,
}: UseUserColumnsProps) {
  const columns: Column<AdminUser>[] = [
    {
      header: "STT",
      className: "w-14",
      cell: (_, index) => (
        <span className="font-mono text-[11px] font-semibold text-muted-foreground tabular-nums">
          {String((page - 1) * limit + index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "Người dùng",
      className: "w-72",
      cell: (user) => <UserCell user={user} />,
    },
    {
      header: "Vai trò",
      className: "w-44",
      cell: (user) => {
        const roles = getUserRoles(user);
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className={`${ROLE_COLORS[role as keyof typeof ROLE_COLORS]} h-5 border-none py-0 text-[10px] shadow-none`}
              >
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
              </Badge>
            ))}
          </div>
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
          <span>{formatDateVn(user.created_at, "dd/MM/yyyy")}</span>
        </div>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (user) => (
        <UserActionsMenu user={user} onStatusUpdate={onStatusUpdate} />
      ),
    },
  ];

  return columns;
}
