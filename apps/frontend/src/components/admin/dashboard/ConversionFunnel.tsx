import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BOOKING_STATUS_LABELS } from "@/constants";
import type { ConversionFunnelPoint } from "@/types/admin.types";
import { BookingStatus } from "@/types";

interface ConversionFunnelProps {
  data: ConversionFunnelPoint[];
}

// Keys are driven by BOOKING_STATUS_LABELS so they never drift from constants.ts
// Mỗi trạng thái là mutually exclusive → cộng lại = tổng booking
const STATUS_CONFIG: Record<
  string,
  { bar: string; seg: string; dot: string; text: string }
> = {
  [BOOKING_STATUS_LABELS[BookingStatus.PENDING]]: {
    bar: "from-amber-400 to-amber-500",
    seg: "bg-amber-400",
    dot: "bg-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  [BOOKING_STATUS_LABELS[BookingStatus.COMPLETED]]: {
    bar: "from-blue-500 to-indigo-500",
    seg: "bg-blue-500",
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
  },
  [BOOKING_STATUS_LABELS[BookingStatus.CONFIRMED]]: {
    bar: "from-emerald-500 to-green-500",
    seg: "bg-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

const CANCELED_KEY = BOOKING_STATUS_LABELS[BookingStatus.CANCELED];

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const total = data.find((d) => d.stage === "Tạo booking");
  const statuses = data.filter(
    (d) => d.stage !== "Tạo booking" && d.stage !== CANCELED_KEY,
  );
  const canceled = data.find((d) => d.stage === CANCELED_KEY);
  const totalVal = total?.value || 1;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-sm font-bold">Phân bổ trạng thái</CardTitle>
        <CardDescription className="text-[11px]">
          Thống kê booking 30 ngày gần nhất
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-5 px-5 pb-5">
        {/* Tổng */}
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tabular-nums text-foreground">
            {totalVal.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            lượt đặt sân
          </p>
        </div>

        {/* Stacked bar — mỗi segment = % tổng của từng trạng thái */}
        <div className="flex h-2.5 rounded-full overflow-hidden gap-[2px]">
          {statuses.map((s) => {
            const cfg = STATUS_CONFIG[s.stage];
            return (
              <div
                key={s.stage}
                className={`${cfg?.seg ?? "bg-muted"} transition-all duration-700 rounded-sm`}
                style={{ flex: s.value }}
                title={`${s.stage}: ${s.dropOffPct}%`}
              />
            );
          })}
          {canceled && (
            <div
              className="bg-rose-500 transition-all duration-700 rounded-sm"
              style={{ flex: canceled.value }}
              title={`Đã hủy: ${canceled.dropOffPct}%`}
            />
          )}
        </div>

        {/* Rows từng trạng thái */}
        <div className="space-y-3.5">
          {statuses.map((s) => {
            const cfg = STATUS_CONFIG[s.stage];
            const barW = (s.value / totalVal) * 100;

            return (
              <div key={s.stage} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${cfg?.dot ?? "bg-muted"}`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {s.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black tabular-nums ${cfg?.text ?? "text-foreground"}`}
                    >
                      {s.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold w-8 text-right tabular-nums">
                      {s.dropOffPct}%
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${cfg?.bar ?? "bg-muted"} transition-all duration-700`}
                    style={{ width: `${barW}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Canceled — nhóm cuối */}
        {canceled && (
          <div className="mt-auto p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-rose-500">
                  Đã hủy
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-500 tabular-nums">
                {canceled.dropOffPct}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-rose-700 dark:text-rose-400 tabular-nums">
                {canceled.value.toLocaleString()}
              </p>
              <div className="flex-1 ml-4 h-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${canceled.dropOffPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
