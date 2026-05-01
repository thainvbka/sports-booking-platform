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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { useAdminStore } from "@/store/admin/useAdminStore";
import { useEffect, useMemo, useState } from "react";

interface SectionHeadingProps {
  index: number;
  title: string;
}

function SectionHeading({
  index,
  title,
}: SectionHeadingProps) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 font-display text-[10px] font-black italic tracking-tight text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold italic tracking-tight text-foreground md:text-lg">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}

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
      <div className="space-y-5 pb-8">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="col-span-12 h-[320px] rounded-xl lg:col-span-8" />
          <Skeleton className="col-span-12 h-[320px] rounded-xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 pb-8">
      {/* ── HERO HEADER ── */}
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3 md:px-5 md:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-border/60 bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-block size-1.5 rounded-full bg-primary" />
                </span>
                {formattedDate}
              </Badge>
            </div>

            <h1 className="font-display text-2xl font-black italic leading-[1.05] tracking-tight text-foreground md:text-3xl">
              Toàn cảnh vận hành{" "}
              <span className="text-primary">T-Sport</span>
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-muted-foreground md:text-sm">
              Theo dõi doanh thu, đặt sân và chất lượng dịch vụ trong một khung
              nhìn duy nhất. Dữ liệu cập nhật liên tục từ toàn bộ
              cụm sân trên hệ thống.
            </p>

            {/* summary meta strip */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Doanh thu tháng
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-blue-500" />
                {analytics.kpis.bookings.thisMonth.toLocaleString()} lượt đặt
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                {analytics.kpis.avgRating.toFixed(1)} / 5 điểm đánh giá
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-violet-500" />
                {analytics.kpis.complexes.total} cụm sân
              </span>
            </div>
          </div>

          <div className="shrink-0 lg:pb-0.5">
            <QuickActions />
          </div>
        </div>
      </header>

      {/* ── SECTION 1: PULSE (KPIs) ── */}
      <section>
        <SectionHeading
          index={1}
          title="Chỉ số trọng yếu"
        />
        <KpiCards kpis={analytics.kpis} />
      </section>

      {/* ── SECTION 2: PERFORMANCE CORE ── */}
      {/* Chart chính 2/3 · funnel 1/3 — đủ rộng cho cả hai */}
      <section>
        <SectionHeading
          index={2}
          title="Hiệu suất tài chính & chuyển đổi"
        />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueQualityChart data={analytics.revenueTrend} />
          </div>
          <div className="lg:col-span-1">
            <ConversionFunnel data={analytics.conversionFunnel} />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: ACTIVITY & MANAGEMENT ── */}
      {/* Hai danh sách cân bằng 50/50 — mỗi bên đọc rõ, không cảm giác thừa cột */}
      <section>
        <SectionHeading
          index={3}
          title="Hoạt động & vận hành"
        />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          <TopComplexes data={analytics.topComplexes} />
          <RecentTransactions payments={recentPayments} />
        </div>
      </section>

      {/* ── SECTION 4: GROWTH & QUALITY ── */}
      {/* Ba khối đồng nhất 1/3 — dễ đọc, hết cảm giác "bậc thang" */}
      <section>
        <SectionHeading
          index={4}
          title="Tăng trưởng & chất lượng"
        />
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PlayerGrowthChart data={analytics.retentionData} />
          <SportRevenueMix data={analytics.sportRevenue} />
          <div className="md:col-span-2 lg:col-span-1">
            <RatingDistribution
              data={analytics.ratingDist}
              avgRating={analytics.kpis.avgRating}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 5: DEEP ANALYTICS ── */}
      {/* Heatmap cần chiều ngang — giữ 2/3 · providers 1/3, nhất quán với Section 2 */}
      <section>
        <SectionHeading
          index={5}
          title="Phân tích chuyên sâu"
        />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DemandHeatmap data={heatmapData} />
          </div>
          <div className="lg:col-span-1">
            <PaymentProviders data={analytics.paymentProviderData} />
          </div>
        </div>
      </section>
    </div>
  );
}
