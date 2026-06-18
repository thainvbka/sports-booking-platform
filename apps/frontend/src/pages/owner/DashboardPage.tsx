import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, BarChart3, Clock3, PieChart as PieChartIcon } from "lucide-react";
import { useEffect } from "react";
import { useDashboardChartData } from "@/hooks/owner/useDashboardChartData";
import { useStripeConnection } from "@/hooks/owner/useStripeConnection";
import { DashboardHero } from "@/components/owner/dashboard/DashboardHero";
import { DashboardStats } from "@/components/owner/dashboard/DashboardStats";
import { ChartCard } from "@/components/owner/dashboard/ChartCard";
import { BookingStatusPieChart } from "@/components/owner/dashboard/BookingStatusPieChart";
import { TopSubFieldsBarChart } from "@/components/owner/dashboard/TopSubFieldsBarChart";
import { RevenueByComplexBarChart } from "@/components/owner/dashboard/RevenueByComplexBarChart";
import { HourlyDistributionAreaChart } from "@/components/owner/dashboard/HourlyDistributionAreaChart";
import { DashboardSkeleton } from "@/components/owner/dashboard/DashboardSkeleton";

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
      {/* ── HERO ───────────────────────────────────────────────── */}
      <DashboardHero
        owner={owner}
        currentDate={currentDate}
        isConnected={isConnected}
        onConnectStripe={handleConnectStripe}
      />

      {/* ── STATS ──────────────────────────────────────────────── */}
      <DashboardStats stats={stats} />

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
