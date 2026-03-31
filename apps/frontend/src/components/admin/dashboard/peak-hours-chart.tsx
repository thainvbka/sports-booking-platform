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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { HourlyDistributionPoint } from "@/types/admin.types";
import { Bar, BarChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

interface PeakHoursChartProps {
  data: HourlyDistributionPoint[] | undefined;
}

const chartConfig = {
  bookings: {
    label: "Lượt đặt",
    color: "var(--chart-3)",
  },
  revenue: {
    label: "Doanh thu",
    color: "var(--chart-1)",
  },
};

export function PeakHoursChart({ data = [] }: PeakHoursChartProps) {
  return (
    <Card className="cursor-pointer h-full flex flex-col">
      <CardHeader>
        <CardTitle>Khung giờ cao điểm</CardTitle>
        <CardDescription>
          Tần suất đặt sân theo giờ trong ngày (30 ngày gần nhất)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted/30"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-[10px]"
              interval={2}
            />
            <YAxis axisLine={false} tickLine={false} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="bookings"
              fill="var(--color-bookings)"
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
