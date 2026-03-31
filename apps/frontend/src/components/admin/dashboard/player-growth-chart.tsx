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
import type { RetentionPoint } from "@/types/admin.types";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PlayerGrowthChartProps {
  data: RetentionPoint[];
}

export function PlayerGrowthChart({ data }: PlayerGrowthChartProps) {
  const stats = useMemo(() => {
    if (!data.length) return null;

    const lastRetention = data[data.length - 1];
    const retentionPct = lastRetention
      ? Math.round(
          (lastRetention.returning /
            Math.max(lastRetention.returning + lastRetention.new, 1)) *
            100,
        )
      : 0;

    const totalPlayers = data.reduce((s, r) => s + r.new + r.returning, 0);
    const avgNew = Math.round(
      data.reduce((s, r) => s + r.new, 0) / data.length,
    );

    const lastTwo = data.slice(-2);
    const momGrowth =
      lastTwo.length === 2
        ? (() => {
            const prev = lastTwo[0].new + lastTwo[0].returning;
            const curr = lastTwo[1].new + lastTwo[1].returning;
            return prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;
          })()
        : null;

    const peakMonth = data.reduce((best, d) =>
      d.new + d.returning > best.new + best.returning ? d : best,
    );

    return { retentionPct, totalPlayers, avgNew, momGrowth, peakMonth };
  }, [data]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 pt-5 px-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Tăng trưởng người chơi</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              Lần đầu đặt sân (mới) vs đã từng đặt (quay lại) · 6 tháng
            </CardDescription>
          </div>
          {stats?.momGrowth !== null && stats?.momGrowth !== undefined && (
            <MomBadge growth={stats.momGrowth} />
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex-1 flex flex-col gap-3">
        {/* Area chart */}
        <div className="flex-1 min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: -24, bottom: -6, top: 4, right: 4 }}
            >
              <defs>
                <linearGradient id="gradReturning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted) / 0.35)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<DarkTip showTotal reverseOrder />}
                cursor={{
                  stroke: "hsl(var(--muted-foreground) / 0.3)",
                  strokeWidth: 1,
                  strokeDasharray: "4 2",
                }}
              />

              <Area
                type="monotone"
                dataKey="returning"
                name="Quay lại"
                stackId="1"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradReturning)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#6366f1",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="new"
                name="Người mới"
                stackId="1"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#gradNew)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#22c55e",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Custom legend */}
        <div className="flex items-center justify-center gap-5">
          <ChartLegendItem label="Quay lại" color="bg-indigo-500" type="line" />
          <ChartLegendItem label="Người mới" color="bg-emerald-500" type="line" />
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            <StatChip label="Tỷ lệ quay lại" value={`${stats.retentionPct}%`} color="indigo" center />
            <StatChip label="TB mới/tháng" value={stats.avgNew.toLocaleString()} color="muted" center />
            <StatChip label="Đỉnh cao" value={stats.peakMonth.name} color="emerald" center />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
