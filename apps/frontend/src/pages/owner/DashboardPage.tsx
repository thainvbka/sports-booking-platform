import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ownerService } from "@/services/owner.service";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export function OwnerDashboardPage() {
  const { isLoading, error, dashboardStats, getStatsMetrics } =
    useComplexStore();
  const { user: owner } = useAuthStore();

  const [isConnected, setIsConnected] = useState(false);

  // Fetch dashboard stats khi component mount
  useEffect(() => {
    getStatsMetrics();
  }, [getStatsMetrics]);

  useEffect(() => {
    ownerService
      .getStripeStatus()
      .then((data) => {
        setIsConnected(data.data.isComplete);
      })
      .catch((error) => {
        toast.error(
          "Đã có lỗi xảy ra khi kiểm tra trạng thái kết nối Stripe. Vui lòng thử lại sau.",
        );
        console.error("Lỗi khi lấy trạng thái Stripe:", error);
      });
  }, []);
  console.log("isConnected:", isConnected);

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
  const isRevenueUp = stats.revenueGrowth >= 0;

  const currentDate = format(new Date(), "EEEE, d MMMM, yyyy", { locale: vi });

  // Prepare chart data
  const bookingStatusData = useMemo(() => {
    if (!dashboardStats?.bookingStatusDistribution) return [];
    const dist = dashboardStats.bookingStatusDistribution;
    return [
      {
        status: "Hoàn thành",
        value: dist.completed,
        fill: "url(#completedGradient)",
      },
      {
        status: "Đã xác nhận",
        value: dist.confirmed,
        fill: "url(#confirmedGradient)",
      },
      {
        status: "Chờ xử lý",
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

  const topSubFieldsData = useMemo(() => {
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

  const revenueByComplexData = useMemo(() => {
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

  const hourlyDistributionData = useMemo(() => {
    if (!dashboardStats?.hourlyDistribution) return [];
    return dashboardStats.hourlyDistribution.map((item) => ({
      hour: `${item.hour}:00`,
      bookings: item.bookingCount,
      revenue: item.revenue,
    }));
  }, [dashboardStats]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive bg-destructive/10 rounded-md m-4">
        Error: {error}
      </div>
    );
  }

  const handleConnectStripe = async () => {
    try {
      const data = await ownerService.createStripeLink();
      window.location.href = data.data.url; // Redirect sang Stripe
    } catch (error) {
      toast.error(
        "Đã có lỗi xảy ra khi kết nối với Stripe. Vui lòng thử lại sau.",
      );
      console.error("Lỗi kết nối Stripe:", error);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Xin chào, {owner?.full_name || "Chủ sân"} 👋
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">
            {currentDate} • Tổng quan hoạt động kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            //nếu đã kết nối stripe
            <>
              {/* Badge trạng thái (chỉ hiện trên màn hình desktop cho đỡ chật) */}
              <div className="hidden md:flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-full border border-green-200 text-sm font-medium animate-in fade-in">
                <CheckCircle className="w-4 h-4" />
                <span className="whitespace-nowrap">Ví đã kết nối</span>
              </div>

              {/* Nút Thêm sân */}
              <Link to="/owner/complexes">
                <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khu phức hợp mới
                </Button>
              </Link>
            </>
          ) : (
            //nếu chưa kết nối stripe
            <Button
              onClick={handleConnectStripe}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Kết nối Ví thanh toán
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-linear-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.totalRevenue.toLocaleString()} đ
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span
                className={`flex items-center gap-1 mr-2 font-medium px-1.5 py-0.5 rounded-full ${
                  isRevenueUp
                    ? "text-green-600 bg-green-100"
                    : "text-red-600 bg-red-100"
                }`}
              >
                {isRevenueUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(stats.revenueGrowth)}%
              </span>
              so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-linear-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lượt Đặt Sân
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {stats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">
                +{stats.newBookingsThisWeek}
              </span>{" "}
              lượt đặt mới tuần này
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-linear-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Khu Phức Hợp
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {stats.totalComplexes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">
                {stats.activeSubFields}
              </span>{" "}
              sân đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-linear-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Khách Hàng
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">
              {stats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">
                +{stats.newCustomers}
              </span>{" "}
              khách hàng mới
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Status Distribution - Pie Chart */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Phân bố theo trạng thái booking
            </CardTitle>
            <CardDescription>
              Tổng quan tình trạng các lượt đặt sân
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingStatusData.length > 0 ? (
              <ChartContainer
                config={{
                  "Hoàn thành": { label: "Hoàn thành", color: "#10b981" },
                  "Đã xác nhận": { label: "Đã xác nhận", color: "#3b82f6" },
                  "Chờ xử lý": { label: "Chờ xử lý", color: "#f59e0b" },
                  "Đã hủy": { label: "Đã hủy", color: "#ef4444" },
                }}
                className="h-75"
              >
                <PieChart>
                  <defs>
                    <linearGradient
                      id="completedGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#34d399"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                    <linearGradient
                      id="confirmedGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#60a5fa"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                    <linearGradient
                      id="pendingGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#fbbf24"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                    <linearGradient
                      id="cancelledGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#f87171"
                        stopOpacity={0.8}
                      />
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
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(props: {
                      payload?: { status?: string };
                      name: string;
                      value: number;
                    }) =>
                      `${props.payload?.status || props.name}: ${props.value}`
                    }
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
        {/* Top SubFields - Bar Chart */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Top sân được đặt nhiều nhất
            </CardTitle>
            <CardDescription>5 sân có lượt đặt cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {topSubFieldsData.length > 0 ? (
              <ChartContainer
                config={{
                  bookings: { label: "Lượt đặt", color: "#8b5cf6" },
                }}
                className="h-75"
              >
                <BarChart data={topSubFieldsData}>
                  <defs>
                    <linearGradient
                      id="bookingsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#a78bfa"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) =>
                          name === "bookings"
                            ? [`${value} lượt`, "Lượt đặt"]
                            : [
                                `${Number(value).toLocaleString()} đ`,
                                "Doanh thu",
                              ]
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="bookings"
                    fill="url(#bookingsGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Complex & Hourly Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Complex - Bar Chart */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Doanh thu theo khu phức hợp
            </CardTitle>
            <CardDescription>
              So sánh doanh thu giữa các khu phức hợp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByComplexData.length > 0 ? (
              <ChartContainer
                config={{
                  revenue: { label: "Doanh thu", color: "#f97316" },
                }}
                className="h-75"
              >
                <BarChart data={revenueByComplexData} layout="vertical">
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#fb923c" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                    width={100}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) =>
                          name === "revenue"
                            ? [
                                `${Number(value).toLocaleString()} đ`,
                                "Doanh thu",
                              ]
                            : [`${value} lượt`, "Lượt đặt"]
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#revenueGradient)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
        {/* Hourly Distribution - Area Chart */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Phân bố theo khung giờ
            </CardTitle>
            <CardDescription>
              Lượt đặt sân theo từng giờ trong ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyDistributionData.length > 0 ? (
              <ChartContainer
                config={{
                  bookings: { label: "Lượt đặt", color: "#06b6d4" },
                }}
                className="h-75"
              >
                <AreaChart data={hourlyDistributionData}>
                  <defs>
                    <linearGradient
                      id="colorBookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                      <stop
                        offset="50%"
                        stopColor="#22d3ee"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="#67e8f9"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) =>
                          name === "bookings"
                            ? [`${value} lượt`, "Lượt đặt"]
                            : [
                                `${Number(value).toLocaleString()} đ`,
                                "Doanh thu",
                              ]
                        }
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
