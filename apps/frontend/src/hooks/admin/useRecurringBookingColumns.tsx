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
import { Eye, MapPin, MoreHorizontal, Repeat2, User } from "lucide-react";
import { formatDateVn, formatPrice, sportLabel } from "@/utils";
import { RECURRENCE_TYPE_LABELS, RECURRING_STATUS_COLORS, RECURRING_STATUS_LABELS } from "@/lib/constants";
import type { AdminRecurringRow } from "@/types/admin.types";

export function useRecurringBookingColumns(onViewDetail: (booking: AdminRecurringRow) => void) {
  const columns: Column<AdminRecurringRow>[] = [
    {
      header: "Mã nhóm",
      className: "w-20",
      cell: (rb) => (
        <span className="block w-16 truncate font-mono text-[10px] uppercase text-muted-foreground">
          {rb.id.split("-")[0]}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-52",
      cell: (rb) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{rb.player.account.full_name}</span>
          </div>
          <span className="ml-5 truncate text-[10px] text-muted-foreground">
            {rb.player.account.phone_number}
          </span>
        </div>
      ),
    },
    {
      header: "Khu phức hợp",
      className: "w-56",
      cell: (rb) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-3.5 shrink-0 text-rose-500" />
            <span className="truncate">
              {rb.sub_field.complex.complex_name}
            </span>
          </div>
          <div className="ml-5 flex items-center gap-1 text-[10px] italic text-muted-foreground">
            <span>{rb.sub_field.sub_field_name}</span>
            <span>•</span>
            <span>{sportLabel(rb.sub_field.sport_type)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Chu kỳ",
      className: "w-40",
      cell: (rb) => (
        <div className="flex flex-col gap-1">
          <Badge className="h-5 w-fit gap-1 border-none bg-violet-100 py-0 text-[10px] text-violet-800 shadow-none dark:bg-violet-500/15 dark:text-violet-300">
            <Repeat2 className="size-2.5" />
            {RECURRENCE_TYPE_LABELS[rb.recurrence_type] ?? rb.recurrence_type}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatDateVn(rb.start_date, "dd/MM/yy")} →{" "}
            {formatDateVn(rb.end_date, "dd/MM/yy")}
          </span>
        </div>
      ),
    },
    {
      header: "Số buổi",
      className: "w-20 text-center",
      cell: (rb) => (
        <div className="text-center">
          <span className="font-display text-sm font-black italic text-foreground">
            {rb.child_count}
          </span>
          <span className="text-[10px] text-muted-foreground"> buổi</span>
        </div>
      ),
    },
    {
      header: "Tổng tiền",
      className: "w-28",
      cell: (rb) => (
        <span className="font-display text-sm font-black italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatPrice(rb.total_value)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-32",
      cell: (rb) => (
        <Badge
          className={`${RECURRING_STATUS_COLORS[rb.status] ?? "bg-muted text-muted-foreground"} h-5 border-none py-0 text-[10px] shadow-none`}
        >
          {RECURRING_STATUS_LABELS[rb.status] ?? rb.status}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12 text-right",
      cell: (rb) => (
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
                  onViewDetail(rb);
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
