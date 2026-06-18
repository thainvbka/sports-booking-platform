import type { StatsMetrics } from "@/types";
import { useMemo } from "react";

export interface BookingStatusDataItem {
  status: string;
  value: number;
  fill: string;
}

export interface TopSubFieldsDataItem {
  name: string;
  bookings: number;
  revenue: number;
}

export interface RevenueByComplexDataItem {
  name: string;
  revenue: number;
  bookings: number;
}

export interface HourlyDistributionDataItem {
  hour: string;
  bookings: number;
  revenue: number;
}

export function useDashboardChartData(dashboardStats: StatsMetrics | null) {
  const bookingStatusData = useMemo<BookingStatusDataItem[]>(() => {
    if (!dashboardStats?.bookingStatusDistribution) return [];
    const dist = dashboardStats.bookingStatusDistribution;
    return [
      {
        status: "Chờ xác nhận",
        value: dist.completed,
        fill: "url(#completedGradient)",
      },
      {
        status: "Đã xác nhận",
        value: dist.confirmed,
        fill: "url(#confirmedGradient)",
      },
      {
        status: "Chưa thanh toán",
        value: dist.pending,
        fill: "url(#pendingGradient)",
      },
      {
        status: "Đã hủy",
        value: dist.cancelled,
        fill: "url(#cancelledGradient)",
      },
    ].filter((item) => item.value > 0);
  }, [dashboardStats]);

  const topSubFieldsData = useMemo<TopSubFieldsDataItem[]>(() => {
    if (!dashboardStats?.topSubFields) return [];
    return dashboardStats.topSubFields.slice(0, 5).map((field) => ({
      name:
        field.name.length > 15
          ? field.name.substring(0, 15) + "..."
          : field.name,
      bookings: field.bookingCount,
      revenue: field.revenue,
    }));
  }, [dashboardStats]);

  const revenueByComplexData = useMemo<RevenueByComplexDataItem[]>(() => {
    if (!dashboardStats?.revenueByComplex) return [];
    return dashboardStats.revenueByComplex.map((complex) => ({
      name:
        complex.name.length > 15
          ? complex.name.substring(0, 15) + "..."
          : complex.name,
      revenue: complex.revenue,
      bookings: complex.bookingCount,
    }));
  }, [dashboardStats]);

  const hourlyDistributionData = useMemo<HourlyDistributionDataItem[]>(() => {
    if (!dashboardStats?.hourlyDistribution) return [];
    return dashboardStats.hourlyDistribution.map((item) => ({
      hour: `${item.hour}:00`,
      bookings: item.bookingCount,
      revenue: item.revenue,
    }));
  }, [dashboardStats]);

  return {
    bookingStatusData,
    topSubFieldsData,
    revenueByComplexData,
    hourlyDistributionData,
  };
}
