import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getBookingStatusLabel } from "@/utils";
import { BookingStatus } from "@/types";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Clock, CreditCard, XCircle, Zap } from "lucide-react";

const BOOKING_STATUS_TAB_META: Record<
  BookingStatus,
  {
    icon: LucideIcon;
    label: string;
    tint: string;
    dot: string;
  }
> = {
  [BookingStatus.PENDING]: {
    icon: CreditCard,
    label: "Chờ thanh toán",
    tint: "data-[state=active]:bg-amber-500/10 data-[state=active]:border-amber-400/40",
    dot: "bg-amber-500",
  },
  [BookingStatus.CONFIRMED]: {
    icon: BadgeCheck,
    label: "Đã xác nhận",
    tint: "data-[state=active]:bg-emerald-500/10 data-[state=active]:border-emerald-400/40",
    dot: "bg-emerald-500",
  },
  [BookingStatus.COMPLETED]: {
    icon: Clock,
    label: "Đã hoàn thành",
    tint: "data-[state=active]:bg-sky-500/10 data-[state=active]:border-sky-400/40",
    dot: "bg-sky-500",
  },
  [BookingStatus.CANCELED]: {
    icon: XCircle,
    label: "Đã hủy",
    tint: "data-[state=active]:bg-rose-500/10 data-[state=active]:border-rose-400/40",
    dot: "bg-rose-500",
  },
};

interface BookingStatusTabsProps {
  selectedStatus: BookingStatus | "ALL";
  onStatusChange: (status: BookingStatus | "ALL") => void;
  total: number;
  statusCounts: Record<BookingStatus, number>;
}

export function BookingStatusTabs({
  selectedStatus,
  onStatusChange,
  total,
  statusCounts,
}: BookingStatusTabsProps) {
  return (
    <Tabs
      value={selectedStatus}
      onValueChange={(value) => onStatusChange(value as BookingStatus | "ALL")}
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 sm:grid-cols-2 lg:grid-cols-5">
        <TabsTrigger
          value="ALL"
          className={cn(
            "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm",
            "data-[state=active]:border-transparent data-[state=active]:shadow-md data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30",
            "hover:border-border hover:bg-card",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-lg bg-muted/70 text-foreground/80">
                <Zap className="size-3" />
              </span>
              <span className="flex flex-col">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Tất cả
                </span>
                <span className="font-display text-xs font-bold italic text-foreground">
                  Lịch sử
                </span>
              </span>
            </span>
            <span className="font-display text-lg font-black italic tabular-nums text-foreground">
              {total}
            </span>
          </div>
        </TabsTrigger>
        {Object.entries(BOOKING_STATUS_TAB_META).map(([status, meta]) => {
          const Icon = meta.icon;
          const count = statusCounts[status as BookingStatus] ?? 0;
          return (
            <TabsTrigger
              key={status}
              value={status}
              className={cn(
                "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm",
                "data-[state=active]:border-transparent data-[state=active]:shadow-md",
                "hover:border-border hover:bg-card",
                meta.tint,
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-muted/70 text-foreground/80">
                    <Icon className="size-3" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {meta.label.split(" ")[0]}
                    </span>
                    <span className="font-display text-xs font-bold italic text-foreground">
                      {getBookingStatusLabel(status)}
                    </span>
                  </span>
                </span>
                <span className="font-display text-lg font-black italic tabular-nums text-foreground">
                  {count}
                </span>
              </div>
              <span
                aria-hidden
                className={cn(
                  "h-0.5 w-full origin-left rounded-full bg-transparent transition-all",
                  "group-data-[state=active]:bg-gradient-to-r",
                  status === BookingStatus.PENDING && "group-data-[state=active]:from-amber-500 group-data-[state=active]:to-amber-300",
                  status === BookingStatus.CONFIRMED && "group-data-[state=active]:from-emerald-500 group-data-[state=active]:to-emerald-300",
                  status === BookingStatus.COMPLETED && "group-data-[state=active]:from-sky-500 group-data-[state=active]:to-sky-300",
                  status === BookingStatus.CANCELED && "group-data-[state=active]:from-rose-500 group-data-[state=active]:to-rose-300",
                )}
              />
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
