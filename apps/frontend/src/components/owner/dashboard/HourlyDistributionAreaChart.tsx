import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import type { HourlyDistributionDataItem } from "@/hooks/owner/useDashboardChartData";
import { CHART_COLORS } from "@/lib/constants";

interface HourlyDistributionAreaChartProps {
  data: HourlyDistributionDataItem[];
}

export function HourlyDistributionAreaChart({ data }: HourlyDistributionAreaChartProps) {
  return (
    <ChartContainer
      config={{
        bookings: { label: "Lượt đặt", color: CHART_COLORS.CYAN_DARK },
      }}
      className="h-[300px] w-full"
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.CYAN_DARK} stopOpacity={0.9} />
            <stop offset="50%" stopColor={CHART_COLORS.CYAN_MEDIUM} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART_COLORS.CYAN_LIGHT} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          vertical={false}
        />
        <XAxis
          dataKey="hour"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                name === "bookings"
                  ? [`${value} lượt`, "Lượt đặt"]
                  : [`${Number(value).toLocaleString()} đ`, "Doanh thu"]
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="bookings"
          stroke={CHART_COLORS.CYAN_DARK}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorBookings)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
