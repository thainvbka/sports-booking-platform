import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PaymentProviderPoint } from "@/types/admin.types";

const fmtVND = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

interface PaymentProvidersProps {
  data: PaymentProviderPoint[];
}

const PROVIDER_COLORS = [
  {
    bar: "from-blue-500 to-indigo-500",
    dot: "bg-blue-500",
    badge:
      "dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 status-surface-info",
  },
  {
    bar: "from-amber-500 to-orange-500",
    dot: "bg-amber-500",
    badge:
      "dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 status-surface-warning",
  },
  {
    bar: "from-emerald-500 to-teal-500",
    dot: "bg-emerald-500",
    badge:
      "dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 status-surface-success",
  },
  {
    bar: "from-violet-500 to-purple-500",
    dot: "bg-violet-500",
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  },
];

export function PaymentProviders({ data }: PaymentProvidersProps) {
  const maxCount = Math.max(...data.map((x) => x.bookings), 1);
  const totalBookings = data.reduce((s, x) => s + x.bookings, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-lg">Cổng thanh toán</CardTitle>
        <CardDescription className="text-[11px]">
          Tần suất sử dụng & giá trị giao dịch (30 ngày)
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-evenly gap-4 px-6 pb-5">
        {data.map((p, i) => {
          const col = PROVIDER_COLORS[i % PROVIDER_COLORS.length];
          const sharePct =
            totalBookings > 0
              ? ((p.bookings / totalBookings) * 100).toFixed(0)
              : 0;

          return (
            <div key={p.provider} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`}
                  />
                  <span className="text-sm font-black tracking-tight">
                    {p.provider}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badge}`}
                >
                  {sharePct}% share
                </span>
              </div>

              <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${col.bar} transition-all duration-700`}
                  style={{ width: `${(p.bookings / maxCount) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {p.bookings} giao dịch
                </span>
                <div className="text-right">
                  <span className="font-semibold text-foreground">
                    {fmtVND(p.revenue)}
                  </span>
                  <span className="text-muted-foreground ml-1.5">
                    · avg {fmtVND(p.avgTransaction)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
