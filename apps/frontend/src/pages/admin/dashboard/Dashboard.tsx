import { ConversionFunnel } from "@/components/admin/dashboard/conversion-funnel";
import { DemandHeatmap } from "@/components/admin/dashboard/demand-heatmap";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { PaymentProviders } from "@/components/admin/dashboard/payment-providers";
import { PlayerGrowthChart } from "@/components/admin/dashboard/player-growth-chart";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { RatingDistribution } from "@/components/admin/dashboard/rating-distribution";
import {
  RecentTransactions,
  type RecentPayment,
} from "@/components/admin/dashboard/recent-transactions";
import { RevenueQualityChart } from "@/components/admin/dashboard/revenue-quality-chart";
import { SportRevenueMix } from "@/components/admin/dashboard/sport-revenue-mix";
import { TopComplexes } from "@/components/admin/dashboard/top-complexes";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { useAdminStore } from "@/store/admin/useAdminStore";
import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const { analytics, fetchAllData, isLoading } = useAdminStore();
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);

  useEffect(() => {
    fetchAllData();
    fetchRecentPayments();
    // fetchAllData is intentionally excluded — it changes on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecentPayments = async () => {
    try {
      const res = await adminService.getPayments({ page: 1, limit: 10 });
      if (res.success) {
        setRecentPayments(res.data.payments);
      }
    } catch (error) {
      console.error("Failed to fetch recent payments", error);
    }
  };

  const heatmapData = useMemo(() => {
    if (!analytics) return [];
    const hourly = analytics.hourlyDistribution;
    const daily = analytics.dailyDistribution;
    const totalDaily = daily.reduce((a, b) => a + b.bookings, 0) || 1;

    return hourly.map((row) => {
      const result: Record<string, number | string> = { hour: row.hour };
      const DAYS_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      DAYS_NAME.forEach((day) => {
        const dPoint = daily.find((d) => d.name === day) || { bookings: 0 };
        result[day] = Math.round(
          row.bookings * (dPoint.bookings / totalDaily) * 7,
        );
      });
      return result;
    });
  }, [analytics]);

  if (isLoading && !analytics) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 bg-background">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="col-span-8 h-[300px] rounded-xl" />
          <Skeleton className="col-span-4 h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50/40 dark:bg-transparent min-h-screen">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Bảng điều khiển quản trị
            </h2>
          </div>
        </div>
        <QuickActions />
      </div>

      {/* ── SECTION 1: PULSE (KPIs) ── */}
      <KpiCards kpis={analytics.kpis} />

      {/* ── SECTION 2: PERFORMANCE CORE (12-Col Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 xl:col-span-9">
          <RevenueQualityChart data={analytics.revenueTrend} />
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          <ConversionFunnel data={analytics.conversionFunnel} />
        </div>
      </div>

      {/* ── SECTION 3: ACTIVITY & MANAGEMENT ── */}
      {/* Kéo lên cao vì admin cần check Top Complexes & Recent Transactions sớm nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-8">
          <TopComplexes data={analytics.topComplexes} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <RecentTransactions payments={recentPayments} />
        </div>
      </div>

      {/* ── SECTION 4: GROWTH & QUALITY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <PlayerGrowthChart data={analytics.retentionData} />
        </div>
        <div className="lg:col-span-4">
          <SportRevenueMix data={analytics.sportRevenue} />
        </div>
        <div className="lg:col-span-3">
          <RatingDistribution
            data={analytics.ratingDist}
            avgRating={analytics.kpis.avgRating}
          />
        </div>
      </div>

      {/* ── SECTION 5: DEEP ANALYTICS ── */}
      {/* Phân tích chi tiết vận hành — đặt cuối vì không cần action ngay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-10">
        <div className="lg:col-span-7 xl:col-span-8">
          <DemandHeatmap data={heatmapData} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <PaymentProviders data={analytics.paymentProviderData} />
        </div>
      </div>
    </div>
  );
}
