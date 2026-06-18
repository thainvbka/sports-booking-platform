import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TopSubFieldsDataItem } from "@/hooks/owner/useDashboardChartData";
import { CHART_COLORS } from "@/lib/constants";

interface TopSubFieldsBarChartProps {
  data: TopSubFieldsDataItem[];
}

export function TopSubFieldsBarChart({ data }: TopSubFieldsBarChartProps) {
  return (
    <ChartContainer
      config={{
        bookings: { label: "Lượt đặt", color: CHART_COLORS.BOOKINGS },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data}>
        <defs>
          <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.BOOKINGS} stopOpacity={1} />
            <stop offset="100%" stopColor={CHART_COLORS.BOOKINGS_LIGHT} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          vertical={false}
        />
        <XAxis
          dataKey="name"
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
        <Bar
          dataKey="bookings"
          fill="url(#bookingsGradient)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
