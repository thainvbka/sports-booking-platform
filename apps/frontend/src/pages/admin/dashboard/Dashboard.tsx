import { adminService } from "@/services/admin.service";
import { useAdminStore } from "@/store/admin/useAdminStore";
import { useEffect, useState, useMemo } from "react";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { RecentTransactions, type RecentPayment } from "@/components/admin/dashboard/recent-transactions";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { RevenueQualityChart } from "@/components/admin/dashboard/revenue-quality-chart";
import { ConversionFunnel } from "@/components/admin/dashboard/conversion-funnel";
import { DemandHeatmap } from "@/components/admin/dashboard/demand-heatmap";
import { SportRevenueMix } from "@/components/admin/dashboard/sport-revenue-mix";
import { PaymentProviders } from "@/components/admin/dashboard/payment-providers";
import { RatingDistribution } from "@/components/admin/dashboard/rating-distribution";
import { TopComplexes } from "@/components/admin/dashboard/top-complexes";
import { PlayerGrowthChart } from "@/components/admin/dashboard/player-growth-chart";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { analytics, fetchAllData, isLoading } = useAdminStore();
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);

  useEffect(() => {
    fetchAllData();
    fetchRecentPayments();
  }, [fetchAllData]);

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

    return hourly.map(row => {
      const result: any = { hour: row.hour };
      const DAYS_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      DAYS_NAME.forEach((day) => {
        const dPoint = daily.find(d => d.name === day) || { bookings: 0 };
        result[day] = Math.round(row.bookings * (dPoint.bookings / totalDaily) * 7);
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
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Welcome back. Here is what's happening with the platform today.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* ── SECTION 1: PULSE (KPIs) ── */}
      <KpiCards 
        kpis={analytics.kpis} 
        revenueTrend={analytics.revenueTrend} 
        retentionData={analytics.retentionData} 
      />

      {/* ── SECTION 2: PERFORMANCE CORE (12-Col Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 xl:col-span-9">
          <RevenueQualityChart data={analytics.revenueTrend} />
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          <ConversionFunnel data={analytics.conversionFunnel} />
        </div>
      </div>

      {/* ── SECTION 3: OPERATIONAL INSIGHTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-8">
          <DemandHeatmap data={heatmapData} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <SportRevenueMix data={analytics.sportRevenue} />
        </div>
      </div>

      {/* ── SECTION 4: MARKET & GROWTH ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <RatingDistribution data={analytics.ratingDist} avgRating={analytics.kpis.avgRating} />
        </div>
        <div className="lg:col-span-4">
          <PaymentProviders data={analytics.paymentProviderData} />
        </div>
        <div className="lg:col-span-4">
          <PlayerGrowthChart data={analytics.retentionData} />
        </div>
      </div>

      {/* ── SECTION 5: MANAGEMENT & ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-10">
        <div className="lg:col-span-7 xl:col-span-8">
          <TopComplexes data={analytics.topComplexes} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <RecentTransactions payments={recentPayments} />
        </div>
      </div>
    </div>
  );
}
