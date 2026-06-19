import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import type { RevenueByComplexDataItem } from "@/hooks/owner/useDashboardChartData";
import { CHART_COLORS } from "@/constants";

interface RevenueByComplexBarChartProps {
  data: RevenueByComplexDataItem[];
}

export function RevenueByComplexBarChart({ data }: RevenueByComplexBarChartProps) {
  return (
    <ChartContainer
      config={{
        revenue: { label: "Doanh thu", color: CHART_COLORS.REVENUE },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data} layout="vertical">
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CHART_COLORS.REVENUE} stopOpacity={0.85} />
            <stop offset="100%" stopColor={CHART_COLORS.REVENUE_LIGHT} stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          fontSize={11}
          width={100}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                name === "revenue"
                  ? [`${Number(value).toLocaleString()} đ`, "Doanh thu"]
                  : [`${value} lượt`, "Lượt đặt"]
              }
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="url(#revenueGradient)"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
