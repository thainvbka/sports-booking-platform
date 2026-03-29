"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RevenueTrendPoint } from "@/types/admin.types";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

interface SalesChartProps {
  data: RevenueTrendPoint[] | undefined;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  cancelRate: {
    label: "Cancel Rate %",
    color: "var(--chart-2)",
  },
  completionRate: {
    label: "Completion Rate %",
    color: "var(--chart-4)",
  },
};

export function SalesChart({ data = [] }: SalesChartProps) {
  return (
    <Card className="cursor-pointer h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Revenue vs Booking Quality</CardTitle>
          <CardDescription>
            Track monthly revenue alongside cancel and completion rates
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6 flex-1">
        <div className="px-6 pb-6">
          <ChartContainer config={chartConfig} className="h-87.5 w-full">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/30"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
                barSize={26}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cancelRate"
                stroke="var(--color-cancelRate)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="completionRate"
                stroke="var(--color-completionRate)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
