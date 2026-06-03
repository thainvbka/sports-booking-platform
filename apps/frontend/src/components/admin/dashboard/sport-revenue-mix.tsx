import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SportRevenuePoint } from "@/types/admin.types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtM } from "@/lib/format";
import { formatPrice } from "@/utils";

const COLORS = [
  "hsl(var(--primary))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface SportRevenueMixProps {
  data: SportRevenuePoint[];
}

export function SportRevenueMix({ data }: SportRevenueMixProps) {
  const totalSportRev = data.reduce((s, x) => s + x.revenue, 0);
  const totalBookings = data.reduce((s, x) => s + x.bookings, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-lg">Doanh thu theo môn</CardTitle>
        <CardDescription className="text-[11px]">
          Phân bổ doanh thu từ các lượt đặt đã hoàn tất
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-5 flex-1 flex flex-col gap-4">
        {/* Donut chart */}
        <div className="relative h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                dataKey="revenue"
                paddingAngle={3}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  fontSize: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(val: number) => [formatPrice(val), "Doanh thu"]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">
              Tổng
            </p>
            <p className="text-base font-black leading-none text-foreground">
              {fmtM(totalSportRev)}
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/30 border border-muted/60 text-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              Doanh thu
            </p>
            <p className="text-sm font-black text-foreground">
              {fmtM(totalSportRev)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-muted/60 text-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              Lượt đặt
            </p>
            <p className="text-sm font-black text-foreground">
              {totalBookings.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-2">
          {data.slice(0, 6).map((s, i) => {
            const pct =
              totalSportRev > 0
                ? ((s.revenue / totalSportRev) * 100).toFixed(0)
                : 0;
            return (
              <div
                key={s.name}
                className="flex justify-between items-center text-[10px]"
              >
                <span className="flex items-center gap-2 font-bold text-muted-foreground uppercase tracking-tight min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate max-w-[90px]">{s.name}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-black text-foreground">
                    {formatPrice(s.revenue)}
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-muted-foreground font-semibold">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
