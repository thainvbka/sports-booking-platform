import type { LinkedBooking } from "@/types/admin.types";
import { formatDateVn, formatPrice } from "@/utils";
import { MapPin } from "lucide-react";

interface LinkedBookingsListProps {
  bookings: LinkedBooking[];
}

export function LinkedBookingsList({ bookings }: LinkedBookingsListProps) {
  if (bookings.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Các lượt đặt trong giao dịch ({bookings.length})
      </p>
      <div className="space-y-2">
        {bookings.map((booking, idx) => (
          <div
            key={`${booking.start_time}-${idx}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-background text-xs font-bold text-muted-foreground">
                {idx + 1}
              </div>
              <div>
                <p className="flex items-center gap-1 text-sm font-bold">
                  <MapPin className="size-3 text-rose-500" />
                  {booking.sub_field?.complex?.complex_name || "N/A"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {booking.sub_field?.sub_field_name || "Unknown Field"} ·{" "}
                  {formatDateVn(booking.start_time, "dd/MM HH:mm")}
                </p>
              </div>
            </div>
            <p className="font-display text-sm font-black italic tracking-tight text-foreground">
              {formatPrice(Number(booking.total_price))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
