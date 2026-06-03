import {
  ChartLegendItem,
  DarkTip,
  MomBadge,
  StatChip,
} from "@/components/admin/dashboard/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmtM, fmtPct } from "@/lib/format";
import { formatPrice } from "@/utils";
import type { RevenueTrendPoint } from "@/types/admin.types";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueQualityChartProps {
  data: RevenueTrendPoint[];
}

export function RevenueQualityChart({ data }: RevenueQualityChartProps) {
  const stats = useMemo(() => {
    if (!data.length) return null;
    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const avgCancelRate =
      data.reduce((s, d) => s + d.cancelRate, 0) / data.length;
    const bestMonth = data.reduce((best, d) =>
      d.revenue > best.revenue ? d : best,
    );
    const lastTwo = data.slice(-2);
    const momGrowth =
      lastTwo.length === 2 && lastTwo[0].revenue > 0
        ? ((lastTwo[1].revenue - lastTwo[0].revenue) / lastTwo[0].revenue) *
          100
        : null;
    return { totalRevenue, avgCancelRate, bestMonth, momGrowth };
  }, [data]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 pt-5 px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Hiệu suất tài chính</CardTitle>
            <CardDescription className="text-[11px]">
              Doanh thu & tỷ lệ hủy theo tháng (6 tháng gần nhất)
            </CardDescription>
          </div>
          {stats?.momGrowth !== null && stats?.momGrowth !== undefined && (
            <MomBadge growth={stats.momGrowth} />
          )}
        </div>
      </CardHeader>

      {/* Summary stat strip */}
      {stats && (
        <div className="mx-6 mb-3 grid grid-cols-3 gap-2">
          <StatChip label="Tổng 6 tháng" value={fmtM(stats.totalRevenue)} color="primary" />
          <StatChip label="Tỷ lệ hủy TB" value={fmtPct(stats.avgCancelRate)} color="rose" />
          <StatChip label="Tháng tốt nhất" value={stats.bestMonth.name} color="amber" />
        </div>
      )}

      <CardContent className="px-4 pb-5 flex-1">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 12, bottom: 0, left: -5 }}
            >
              <defs>
                <linearGradient
                  id="revenueBarGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.55}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted) / 0.4)"
              />
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 10,
                  fill: "hsl(var(--muted-foreground))",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="rev"
                orientation="left"
                tickFormatter={fmtM}
                tick={{
                  fontSize: 9,
                  fill: "hsl(var(--muted-foreground))",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <YAxis
                yAxisId="rate"
                orientation="right"
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 9, fill: "#f87171", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 40]}
                width={28}
              />
              <Tooltip
                content={
                  <DarkTip
                    formatValue={(name, val) =>
                      name === "Tỷ lệ hủy" ? fmtPct(val) : formatPrice(val)
                    }
                  />
                }
                cursor={{ fill: "hsl(var(--muted) / 0.15)", radius: 4 }}
              />

              <Bar
                yAxisId="rev"
                dataKey="revenue"
                name="Doanh thu"
                fill="url(#revenueBarGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
              />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="cancelRate"
                name="Tỷ lệ hủy"
                stroke="#f87171"
                strokeWidth={2.5}
                dot={{
                  fill: "#f87171",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-3">
          <ChartLegendItem label="Doanh thu" color="bg-primary/80" type="bar" />
          <ChartLegendItem label="Tỷ lệ hủy" color="bg-rose-400" type="line" />
        </div>
      </CardContent>
    </Card>
  );
}
