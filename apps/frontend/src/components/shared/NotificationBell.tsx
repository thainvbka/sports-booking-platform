import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/useNotificationStore";
import type { NotificationTargetRole } from "@/types";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

type NotificationBellProps = {
  targetRole: NotificationTargetRole;
  className?: string;
};

const formatRelative = (isoTime: string) => {
  const date = new Date(isoTime);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

export function NotificationBell({ targetRole, className }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    connectSocket,
    disconnectSocket,
    hydrateForRole,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    connectSocket(targetRole);
    void hydrateForRole(targetRole);
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket, hydrateForRole, targetRole]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative size-8 shrink-0 rounded-full",
            className,
          )}
          aria-label="Thông báo"
        >
          <Bell />
          {unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[9px] font-bold leading-none ring-2 ring-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Thông báo</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => void markAllAsRead(targetRole)}
            disabled={unreadCount === 0}
          >
            Đánh dấu đã đọc
          </Button>
        </div>
        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          <div className="flex flex-col gap-1 p-2">
            {isLoading ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">Đang tải...</p>
            ) : null}

            {!isLoading && notifications.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                Chưa có thông báo nào.
              </p>
            ) : null}

            {notifications.map((item) => (
              <Link
                key={item.id}
                to={item.link_to || "#"}
                className={cn(
                  "rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                  !item.link_to && "pointer-events-none",
                  !item.is_read && "bg-primary/5",
                )}
                onClick={() => {
                  void markAsRead(item.id);
                }}
              >
                <div className="flex items-start gap-2">
                  {!item.is_read ? (
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2">{item.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelative(item.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

