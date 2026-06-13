import { Skeleton } from "@/components/ui/skeleton";
import { Ticket } from "lucide-react";

export function BookingCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-2/3" />

          {/* Address */}
          <Skeleton className="h-4 w-full" />

          {/* Date/Time */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Price */}
          <Skeleton className="h-6 w-32 mt-1" />

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyLedger() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-background/60 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Ticket className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="italic tracking-tight text-heading">
          Chưa có vé nào trong sổ
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Khi bạn đặt sân, mỗi lượt sẽ hiện ở đây như một tấm vé — theo dõi
          thanh toán, thời gian và đánh giá ở cùng một nơi.
        </p>
      </div>
    </div>
  );
}
