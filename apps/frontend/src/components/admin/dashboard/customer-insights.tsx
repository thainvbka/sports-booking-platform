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
import type { RetentionPoint } from "@/types/admin.types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface CustomerInsightsProps {
  data: RetentionPoint[] | undefined;
}

const chartConfig = {
  new: {
    label: "Người chơi mới",
    color: "var(--chart-2)",
  },
  returning: {
    label: "Người chơi quay lại",
    color: "var(--chart-5)",
  },
};

export function CustomerInsights({ data = [] }: CustomerInsightsProps) {
  return (
    <Card className="cursor-pointer h-full flex flex-col">
      <CardHeader>
        <CardTitle>Giữ chân: Người mới vs quay lại</CardTitle>
        <CardDescription>
          Sức khỏe cộng đồng người chơi trong 6 tháng gần nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="new"
              stackId="players"
              fill="var(--color-new)"
              radius={[4, 4, 0, 0]}
              barSize={36}
            />
            <Bar
              dataKey="returning"
              stackId="players"
              fill="var(--color-returning)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
