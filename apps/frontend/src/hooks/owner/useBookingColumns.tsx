import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RECURRENCE_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils";
import type { Column } from "@/components/shared/ui-utility/DataTable";
import type { OwnerBookingResponse } from "@/types";
import {
  formatDateVn,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
  getSportTypeLabel,
} from "@/utils";
import {
  ArrowUpRight,
  Ban,
  Calendar,
  CalendarRange,
  CheckCircle2,
  ChevronsRight,
  Clock,
  MoreVertical,
  Phone,
  Ticket,
  User,
} from "lucide-react";

interface UseBookingColumnsProps {
  queryParams: {
    page: number;
    limit: number;
  };
  onViewDetail: (booking: OwnerBookingResponse) => void;
  onConfirmClick: (bookingId: string, type: "SINGLE" | "RECURRING") => void;
  onCancelClick: (bookingId: string, type: "SINGLE" | "RECURRING") => void;
  canConfirmBooking: (booking: OwnerBookingResponse) => boolean;
  canCancelBooking: (booking: OwnerBookingResponse) => boolean;
}

export function useBookingColumns({
  queryParams,
  onViewDetail,
  onConfirmClick,
  onCancelClick,
  canConfirmBooking,
  canCancelBooking,
}: UseBookingColumnsProps) {
  const columns: Column<OwnerBookingResponse>[] = [
    {
      header: "#",
      className: "w-12",
      cell: (_, index) => (
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {(queryParams.page - 1) * queryParams.limit + index + 1}
        </span>
      ),
    },
    {
      header: "Loại",
      className: "w-24 whitespace-nowrap",
      cell: (booking) => (
        <Badge
          variant="outline"
          className={cn(
            "h-5 gap-1 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
            booking.type === "RECURRING"
              ? "border-violet-300/60 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
              : "border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
          )}
        >
          {booking.type === "RECURRING" ? (
            <CalendarRange className="size-2.5" />
          ) : (
            <Ticket className="size-2.5" />
          )}
          {booking.type === "RECURRING" ? "Định kỳ" : "Đơn lẻ"}
        </Badge>
      ),
    },
    {
      header: "Khách hàng",
      className: "w-48",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{booking.player_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <Phone className="size-3 shrink-0" />
            {booking.player_phone}
          </div>
        </div>
      ),
    },
    {
      header: "Sân",
      className: "w-52",
      cell: (booking) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate text-sm font-medium">
            {booking.complex_name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {booking.sub_field_name} · {getSportTypeLabel(booking.sport_type)}
          </span>
        </div>
      ),
    },
    {
      header: "Thời gian",
      className: "w-56 whitespace-nowrap",
      cell: (booking) =>
        booking.type === "RECURRING" ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <CalendarRange className="size-3.5 text-muted-foreground" />
              <span>{RECURRENCE_TYPE_LABELS[booking.recurrence_type]}</span>
              <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                · {booking.total_slots} buổi
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatDateVn(booking.start_date, "dd/MM/yyyy")}
              <ChevronsRight className="mx-0.5 inline size-3" />
              {formatDateVn(booking.end_date, "dd/MM/yyyy")}
            </span>
            {booking.bookings?.[0] ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                <Clock className="size-3" />
                {formatDateVn(booking.bookings[0].start_time, "HH:mm")}
                {" → "}
                {formatDateVn(booking.bookings[0].end_time, "HH:mm")}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="tabular-nums">
                {formatDateVn(booking.start_time, "EEE, dd/MM/yyyy")}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
              <Clock className="size-3" />
              {formatDateVn(booking.start_time, "HH:mm")} →{" "}
              {formatDateVn(booking.end_time, "HH:mm")}
            </span>
          </div>
        ),
    },
    {
      header: "Giá tiền",
      className: "w-32 whitespace-nowrap text-right",
      cell: (booking) => (
        <div className="text-right">
          <span className="font-display text-sm font-black italic tabular-nums tracking-tight text-foreground">
            {formatPrice(booking.total_price)}
          </span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-36 whitespace-nowrap",
      cell: (booking) => (
        <Badge
          className={cn(
            "h-6 rounded-full px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
            getBookingStatusColor(booking.status),
          )}
        >
          {getBookingStatusLabel(booking.status)}
        </Badge>
      ),
    },
    {
      header: "",
      className: "w-12",
      cell: (booking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Thao tác"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onViewDetail(booking)}
              className="cursor-pointer gap-2"
            >
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
              Xem chi tiết
            </DropdownMenuItem>
            {canConfirmBooking(booking) ? (
              <DropdownMenuItem
                onClick={() => onConfirmClick(booking.id, booking.type)}
                className="cursor-pointer gap-2 text-emerald-700 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-400"
              >
                <CheckCircle2 className="size-3.5" />
                Xác nhận
              </DropdownMenuItem>
            ) : null}
            {canCancelBooking(booking) ? (
              <DropdownMenuItem
                onClick={() => onCancelClick(booking.id, booking.type)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <Ban className="size-3.5" />
                Hủy đặt sân
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
}
