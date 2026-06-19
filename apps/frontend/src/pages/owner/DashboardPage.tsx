import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  BarChart3,
  Clock3,
  PieChart as PieChartIcon,
  DollarSign,
  Calendar,
  Building2,
  Users,
  CheckCircle,
  Plus,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { useDashboardChartData } from "@/hooks/owner/useDashboardChartData";
import { useStripeConnection } from "@/hooks/owner/useStripeConnection";
import { ChartCard } from "@/components/owner/dashboard/ChartCard";
import { BookingStatusPieChart } from "@/components/owner/dashboard/BookingStatusPieChart";
import { TopSubFieldsBarChart } from "@/components/owner/dashboard/TopSubFieldsBarChart";
import { RevenueByComplexBarChart } from "@/components/owner/dashboard/RevenueByComplexBarChart";
import { HourlyDistributionAreaChart } from "@/components/owner/dashboard/HourlyDistributionAreaChart";
import { DashboardSkeleton } from "@/components/owner/dashboard/DashboardSkeleton";
import { OwnerPageHero } from "@/components/owner/OwnerPageHero";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils";

export function OwnerDashboardPage() {
  const { isLoading, error, dashboardStats, getStatsMetrics } =
    useComplexStore();
  const { user: owner } = useAuthStore();

  const { isConnected, handleConnectStripe } = useStripeConnection();

  useEffect(() => {
    getStatsMetrics();
  }, [getStatsMetrics]);

  const stats = {
    totalRevenue: dashboardStats?.overview?.totalRevenue || 0,
    revenueGrowth: dashboardStats?.overview?.revenueGrowth || 0,
    totalBookings: dashboardStats?.overview?.totalBookings || 0,
    newBookingsThisWeek: dashboardStats?.overview?.newBookingsThisWeek || 0,
    totalComplexes: dashboardStats?.overview?.totalComplexes || 0,
    activeSubFields: dashboardStats?.overview?.activeSubFields || 0,
    totalCustomers: dashboardStats?.overview?.totalCustomers || 0,
    newCustomers: dashboardStats?.overview?.newCustomers || 0,
  };

  const {
    bookingStatusData,
    topSubFieldsData,
    revenueByComplexData,
    hourlyDistributionData,
  } = useDashboardChartData(dashboardStats);

  const currentDate = format(new Date(), "EEEE, d MMMM, yyyy", { locale: vi });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl">
        <AlertCircle />
        <AlertTitle>Không tải được dữ liệu</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO & STATS ───────────────────────────────────────── */}
      <OwnerPageHero
        variant="card"
        badge={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-5 gap-1 rounded-full border-border/60 bg-background/70 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm"
            >
              <Clock3 className="size-2.5" />
              <span className="capitalize">{currentDate}</span>
            </Badge>
            {isConnected ? (
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle className="size-2.5" />
                Ví đã kết nối
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-amber-500/40 bg-amber-500/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400"
              >
                <AlertCircle className="size-2.5" />
                Chưa kết nối Stripe
              </Badge>
            )}
          </div>
        }
        title={
          <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
            Xin chào,{" "}
            <span className="italic text-primary">
              {owner?.full_name || "Chủ sân"}
            </span>
          </h1>
        }
        action={
          isConnected ? (
            <Button
              asChild
              size="sm"
              className="group/cta h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow shadow-primary/25 hover:bg-primary/92"
            >
              <Link to="/owner/complexes">
                <Plus data-icon="inline-start" />
                Thêm khu phức hợp
                <ArrowRight
                  data-icon="inline-end"
                  className="transition-transform group-hover/cta:translate-x-0.5"
                />
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleConnectStripe}
              size="sm"
              className="group/cta h-9 rounded-full bg-foreground px-4 text-xs font-semibold text-background shadow hover:bg-foreground/90"
            >
              <Wallet data-icon="inline-start" />
              Kết nối Stripe
              <ArrowRight
                data-icon="inline-end"
                className="transition-transform group-hover/cta:translate-x-0.5"
              />
            </Button>
          )
        }
        stats={[
          {
            icon: DollarSign,
            label: "Tổng doanh thu",
            value: formatPrice(stats.totalRevenue),
            tone: "primary",
            delta: {
              kind: "percent",
              value: stats.revenueGrowth,
              hint: "so với tháng trước",
            },
          },
          {
            icon: Calendar,
            label: "Lượt đặt sân",
            value: stats.totalBookings,
            tone: "sport",
            delta: {
              kind: "count",
              value: stats.newBookingsThisWeek,
              hint: "lượt đặt mới tuần này",
            },
          },
          {
            icon: Building2,
            label: "Khu phức hợp",
            value: stats.totalComplexes,
            tone: "amber",
            delta: {
              kind: "count",
              value: stats.activeSubFields,
              hint: "sân đang hoạt động",
            },
          },
          {
            icon: Users,
            label: "Khách hàng",
            value: stats.totalCustomers,
            tone: "rose",
            delta: {
              kind: "count",
              value: stats.newCustomers,
              hint: "khách hàng mới",
            },
          },
        ]}
      />

      {/* ── CHARTS ROW 1 ───────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          icon={PieChartIcon}
          title="Phân bố trạng thái booking"
          description="Tình trạng các lượt đặt sân hiện tại"
          isEmpty={bookingStatusData.length === 0}
        >
          <BookingStatusPieChart data={bookingStatusData} />
        </ChartCard>

        <ChartCard
          icon={BarChart3}
          title="Top sân đặt nhiều nhất"
          description="5 sân có lượt đặt cao nhất"
          isEmpty={topSubFieldsData.length === 0}
        >
          <TopSubFieldsBarChart data={topSubFieldsData} />
        </ChartCard>
      </section>

      {/* ── CHARTS ROW 2 ───────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          icon={BarChart3}
          title="Doanh thu theo khu phức hợp"
          description="So sánh doanh thu giữa các khu phức hợp"
          isEmpty={revenueByComplexData.length === 0}
        >
          <RevenueByComplexBarChart data={revenueByComplexData} />
        </ChartCard>

        <ChartCard
          icon={Clock3}
          title="Phân bố theo khung giờ"
          description="Lượt đặt sân theo từng giờ trong ngày"
          isEmpty={hourlyDistributionData.length === 0}
        >
          <HourlyDistributionAreaChart data={hourlyDistributionData} />
        </ChartCard>
      </section>
    </div>
  );
}
