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
  eyebrow: string;
  title: string;
  description?: string;
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/5 font-display text-sm font-black italic tracking-tight text-primary shadow-sm">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <h3 className="truncate font-display text-lg font-bold italic tracking-tight text-foreground md:text-xl">
            {title}
          </h3>
        </div>
      </div>
      {description && (
        <p className="hidden max-w-xs text-right text-[11px] leading-snug text-muted-foreground md:block">
          {description}
        </p>
      )}
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
      <div className="space-y-8 pb-10">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
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
    <div className="space-y-10 pb-10">
      {/* ── HERO HEADER ── */}
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur md:p-8">
        {/* ambient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-60 rounded-full bg-accent-sport/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary"
              >
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-block size-1.5 rounded-full bg-primary" />
                </span>
                Pulse realtime
              </Badge>
              <span className="text-[11px] font-semibold capitalize text-muted-foreground">
                · {formattedDate}
              </span>
            </div>

            <h1 className="font-display text-3xl font-black italic leading-[1.05] tracking-tight text-foreground md:text-[2.6rem]">
              Toàn cảnh vận hành{" "}
              <span className="relative inline-block text-primary">
                T-Sport
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-primary/70 via-primary to-accent-sport/70"
                />
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Theo dõi doanh thu, đặt sân và chất lượng dịch vụ trong một khung
              nhìn duy nhất. Dữ liệu cập nhật theo thời gian thực từ toàn bộ
              cụm sân trên hệ thống.
            </p>

            {/* summary meta strip */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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

          <div className="shrink-0">
            <QuickActions />
          </div>
        </div>
      </header>

      {/* ── SECTION 1: PULSE (KPIs) ── */}
      <section>
        <SectionHeading
          index={1}
          eyebrow="Pulse"
          title="Chỉ số trọng yếu"
          description="So sánh với tháng trước · cập nhật theo MoM"
        />
        <KpiCards kpis={analytics.kpis} />
      </section>

      {/* ── SECTION 2: PERFORMANCE CORE ── */}
      {/* Chart chính 2/3 · funnel 1/3 — đủ rộng cho cả hai */}
      <section>
        <SectionHeading
          index={2}
          eyebrow="Performance"
          title="Hiệu suất tài chính & chuyển đổi"
          description="Doanh thu và dòng chảy booking theo tháng"
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
          eyebrow="Activity"
          title="Hoạt động & vận hành"
          description="Xếp hạng cụm sân và giao dịch mới nhất"
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
          eyebrow="Growth"
          title="Tăng trưởng & chất lượng"
          description="Người chơi, cơ cấu môn và mức độ hài lòng"
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
          eyebrow="Analytics"
          title="Phân tích chuyên sâu"
          description="Nhu cầu theo thời gian và cổng thanh toán"
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
