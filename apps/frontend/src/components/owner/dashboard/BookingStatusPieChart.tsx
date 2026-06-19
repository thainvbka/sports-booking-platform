import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { BookingStatusDataItem } from "@/hooks/owner/useDashboardChartData";
import { CHART_COLORS } from "@/constants";
import { Pie, PieChart } from "recharts";

interface BookingStatusPieChartProps {
  data: BookingStatusDataItem[];
}

export function BookingStatusPieChart({ data }: BookingStatusPieChartProps) {
  return (
    <ChartContainer
      config={{
        "Chờ xác nhận": {
          label: "Chờ xác nhận",
          color: CHART_COLORS.STATUS_COMPLETED,
        },
        "Đã xác nhận": {
          label: "Đã xác nhận",
          color: CHART_COLORS.STATUS_CONFIRMED,
        },
        "Chưa thanh toán": {
          label: "Chưa thanh toán",
          color: CHART_COLORS.STATUS_PENDING,
        },
        "Đã hủy": {
          label: "Đã hủy",
          color: CHART_COLORS.STATUS_CANCELLED,
        },
      }}
      className="h-[300px] w-full"
    >
      <PieChart>
        <defs>
          <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.STATUS_COMPLETED} stopOpacity={1} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="confirmedGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.STATUS_CONFIRMED} stopOpacity={1} />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.STATUS_PENDING} stopOpacity={1} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="cancelledGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.STATUS_CANCELLED} stopOpacity={1} />
            <stop offset="100%" stopColor="#f87171" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="status"
              labelKey="status"
              formatter={(value) => `${value} lượt`}
            />
          }
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
          strokeWidth={2}
          label={(props: {
            payload?: { status?: string };
            name: string;
            value: number;
          }) => `${props.payload?.status || props.name}: ${props.value}`}
        />
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  );
}
