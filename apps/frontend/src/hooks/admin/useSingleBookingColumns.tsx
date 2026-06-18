import type { Column } from "@/components/shared/ui-utility/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, Eye, MapPin, MoreHorizontal, User } from "lucide-react";
import { formatDateVn, formatPrice, bookingStatusColor, bookingStatusLabel, sportLabel } from "@/utils";
import type { AdminBookingRow } from "@/types/admin.types";

export function useSingleBookingColumns(onViewDetail: (booking: AdminBookingRow) => void) {
  const columns: Column<AdminBookingRow>[] = [
    {
      header: "Mã",
      className: "w-20",
      cell: (b) => (
        <span className="block w-16 truncate font-mono text-[10px] uppercase text-muted-foreground">
          {b.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-52",
      cell: (b) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{b.player.account.full_name}</span>
          </div>
          <span className="ml-5 truncate text-[10px] text-muted-foreground">
            {b.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Khu phức hợp",
      className: "w-56",
      cell: (b) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-3.5 shrink-0 text-rose-500" />
            <span className="truncate">{b.sub_field.complex.complex_name}</span>
          </div>
          <div className="ml-5 flex items-center gap-1 text-[10px] italic text-muted-foreground">
            <span>{b.sub_field.sub_field_name}</span>
            <span>•</span>
            <span>{sportLabel(b.sub_field.sport_type)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-36",
      cell: (b) => (
        <div className="flex flex-col gap-0.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3 text-muted-foreground" />
            <span>
              {formatDateVn(b.start_time)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3" />
            <span>
              {formatDateVn(b.start_time, "HH:mm")} –{" "}
              {formatDateVn(b.end_time, "HH:mm")}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Thanh toán",
      className: "w-28",
      cell: (b) => (
        <span className="font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(Number(b.total_price))}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (b) => (
        <Badge
          className={`${bookingStatusColor(b.status)} h-5 border-none py-0 text-[10px] shadow-none`}
        >
          {bookingStatusLabel(b.status)}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(b);
                }}
              >
                <Eye /> Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
}
