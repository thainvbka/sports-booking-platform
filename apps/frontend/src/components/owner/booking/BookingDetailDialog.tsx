import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { OwnerBookingResponse } from "@/types";
import {
  formatDateVn,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
  getSportTypeLabel,
} from "@/utils";
import {
  CircleDot,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  Ticket,
  User,
} from "lucide-react";

interface BookingDetailDialogProps {
  booking: OwnerBookingResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto p-0">
        {/* Gradient accent bar */}
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-primary via-accent-sport to-primary"
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          <DialogHeader className="gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-border/60 bg-background px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                <Ticket className="size-2.5" />
                {booking.type === "RECURRING" ? "Định kỳ" : "Đơn lẻ"}
              </Badge>
              <Badge
                className={cn(
                  "h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.18em]",
                  getBookingStatusColor(booking.status),
                )}
              >
                {getBookingStatusLabel(booking.status)}
              </Badge>
            </div>
            <DialogTitle className="font-display text-xl font-black italic tracking-tight">
              {booking.complex_name}
            </DialogTitle>
            <DialogDescription className="flex flex-col gap-1 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <CircleDot className="size-3" />
                <span className="font-medium text-foreground">
                  {booking.sub_field_name}
                </span>
                <Separator orientation="vertical" className="mx-1 h-3" />
                <span>{getSportTypeLabel(booking.sport_type)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3" />
                {booking.complex_address}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Customer */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                  {booking.player_name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                  <Phone className="size-3" />
                  {booking.player_phone}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Khách
            </span>
          </div>

          {/* Time / price */}
          {booking.type === "SINGLE" ? (
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4">
              {/* ticket notches */}
              <span
                aria-hidden
                className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-background ring-1 ring-border/60"
              />
              <span
                aria-hidden
                className="absolute -right-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-background ring-1 ring-border/60"
              />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Thời gian đặt
                  </span>
                  <span className="font-display text-base font-bold italic tabular-nums tracking-tight">
                    {formatDateVn(booking.start_time, "EEEE, dd/MM/yyyy")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                    <Clock className="size-3.5" />
                    {formatDateVn(booking.start_time, "HH:mm")} →{" "}
                    {formatDateVn(booking.end_time, "HH:mm")}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Tổng tiền
                  </span>
                  <span className="font-display text-xl font-black italic tabular-nums tracking-tight text-primary">
                    {formatPrice(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Tổng số buổi
                  </span>
                  <span className="font-display text-lg font-black italic tabular-nums tracking-tight">
                    {booking.total_slots}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Tổng tiền
                  </span>
                  <span className="font-display text-lg font-black italic tabular-nums tracking-tight text-primary">
                    {formatPrice(booking.total_price)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Danh sách buổi
                </span>
              </div>

              <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                {booking.bookings?.map((slot, idx) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-[10px] font-bold tabular-nums text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold tabular-nums">
                          {formatDateVn(slot.start_time, "EEE, dd/MM/yyyy")}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                          <Clock className="size-3" />
                          {formatDateVn(slot.start_time, "HH:mm")} →{" "}
                          {formatDateVn(slot.end_time, "HH:mm")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className={cn(
                          "h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          getBookingStatusColor(slot.status),
                        )}
                      >
                        {getBookingStatusLabel(slot.status)}
                      </Badge>
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        {formatPrice(slot.total_price)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
