import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ban, CheckCircle, MoreHorizontal, XCircle } from "lucide-react";
import { getUserRoles, getUserStatus } from "@/utils";
import type { AdminUser } from "@/types/admin.types";

interface UserActionsMenuProps {
  user: AdminUser;
  onStatusUpdate: (id: string, role: string, status: string) => void;
}

export function UserActionsMenu({ user, onStatusUpdate }: UserActionsMenuProps) {
  const role = getUserRoles(user)[0] || "PLAYER";
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
              onClick={() => onStatusUpdate(user.id, role, "ACTIVE")}
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
                  onStatusUpdate(
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
              onClick={() => onStatusUpdate(user.id, role, "REJECTED")}
              className="text-rose-600 dark:text-rose-400"
            >
              <XCircle /> Từ chối duyệt
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
