import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { SubfieldProduct } from "@/types";
import { formatPrice } from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarRange, Clock3, Info, Package, Repeat2 } from "lucide-react";

type BookingType = "single" | "recurring";

interface SelectedAddonItem {
  product: SubfieldProduct;
  quantity: number;
}

interface BookingConfirmStepProps {
  subfieldName: string;
  bookingType: BookingType;
  date?: Date;
  endDate?: Date;
  customStartTime: string;
  customEndTime: string;
  selectedAddons: SelectedAddonItem[];
}

export function BookingConfirmStep({
  subfieldName,
  bookingType,
  date,
  endDate,
  customStartTime,
  customEndTime,
  selectedAddons,
}: BookingConfirmStepProps) {
  const isRecurring = bookingType === "recurring";
  const timeRange =
    customStartTime && customEndTime
      ? `${customStartTime} – ${customEndTime}`
      : "--:-- – --:--";

  return (
    <div className="flex flex-col gap-4">
      {/* Recap strip (concise — sidebar has full detail) */}
      <div className="flex flex-wrap gap-2">
        <RecapChip
          icon={isRecurring ? Repeat2 : CalendarRange}
          label={isRecurring ? "Định kỳ" : "Một lần"}
          value={
            isRecurring
              ? `${date ? format(date, "dd/MM", { locale: vi }) : "--/--"} → ${
                  endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "--/--/----"
                }`
              : date
                ? format(date, "EEEE, dd/MM/yyyy", { locale: vi })
                : "--/--/----"
          }
        />
        <RecapChip icon={Clock3} label="Khung giờ" value={timeRange} />
      </div>

      {/* Addons breakdown */}
      {selectedAddons.length > 0 ? (
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-primary/3 p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/15 text-primary">
              <Package className="size-3.5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                Trang bị đi kèm
              </span>
              <span className="font-display text-sm font-bold italic tracking-tight text-foreground">
                {selectedAddons.length} loại · sẵn sàng ra sân
              </span>
            </div>
          </div>

          <Separator className="my-3 border-dashed" />

          <ul className="flex flex-col gap-1.5">
            {selectedAddons.map((item) => (
              <li
                key={item.product.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span className="truncate text-foreground">
                    {item.product.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                    ×{item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Final note */}
      <Alert className="border-amber-200/80 bg-amber-50/70 text-amber-900">
        <Info className="size-4" />
        <AlertTitle className="font-display text-sm font-bold italic tracking-tight">
          Sau khi xác nhận — bạn có 10 phút để thanh toán
        </AlertTitle>
        <AlertDescription className="text-xs text-amber-800/90">
          Sân <span className="font-semibold">{subfieldName}</span> sẽ được giữ
          chỗ tạm thời. Nếu quá thời gian, đơn sẽ tự động hủy để nhường cho
          người chơi khác.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────
function RecapChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-2/50 px-3 py-1.5 text-xs">
      <Icon className="size-3.5 text-primary/70" />
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}
