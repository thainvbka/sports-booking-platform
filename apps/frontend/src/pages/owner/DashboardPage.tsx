import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ownerService } from "@/services/owner.service";
import { useComplexStore } from "@/store/owner/useComplexStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Clock3,
  DollarSign,
  PieChart as PieChartIcon,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
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

/* ────────────────────────────────────────────────────────────── */
/* Stat card                                                       */
/* ────────────────────────────────────────────────────────────── */

type StatTone = "primary" | "sport" | "amber" | "rose";

const STAT_TONE_CLASSES: Record<
  StatTone,
  { surface: string; iconBg: string; iconFg: string; accent: string }
> = {
  primary: {
    surface: "from-primary/8 via-background to-background",
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
    accent: "bg-primary",
  },
  sport: {
    surface: "from-accent-sport/10 via-background to-background",
    iconBg: "bg-accent-sport/10",
    iconFg: "text-accent-sport",
    accent: "bg-accent-sport",
  },
  amber: {
    surface: "from-amber-500/10 via-background to-background",
    iconBg: "bg-amber-500/10",
    iconFg: "text-amber-600 dark:text-amber-400",
    accent: "bg-amber-500",
  },
  rose: {
    surface: "from-rose-500/10 via-background to-background",
    iconBg: "bg-rose-500/10",
    iconFg: "text-rose-600 dark:text-rose-400",
    accent: "bg-rose-500",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  tone = "primary",
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  unit?: string;
  delta?: {
    kind: "percent" | "count";
    value: number;
    hint: string;
  };
  tone?: StatTone;
}) {
  const t = STAT_TONE_CLASSES[tone];
  const isUp = (delta?.value ?? 0) >= 0;

  return (
    <Card className="group relative overflow-hidden border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-0.5", t.accent)}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-70",
          t.surface,
        )}
      />

      <CardHeader className="relative flex-row items-center justify-between gap-2 px-4 pb-1 pt-3">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </CardTitle>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            t.iconBg,
          )}
        >
          <Icon className={cn("size-3.5", t.iconFg)} />
        </span>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-1 px-4 pb-3">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-black italic tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {delta && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Badge
              variant="outline"
              className={cn(
                "h-4 gap-0.5 rounded-full border-transparent px-1.5 text-[9.5px] font-semibold tabular-nums",
                delta.kind === "percent"
                  ? isUp
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-accent-sport/10 text-accent-sport",
              )}
            >
              {delta.kind === "percent" ? (
                isUp ? (
                  <TrendingUp className="size-2.5" />
                ) : (
                  <TrendingDown className="size-2.5" />
                )
              ) : (
                <Sparkles className="size-2.5" />
              )}
              {delta.kind === "percent"
                ? `${isUp ? "+" : "−"}${Math.abs(delta.value)}%`
                : `+${delta.value}`}
            </Badge>
            <span className="truncate">{delta.hint}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Chart wrapper                                                   */
/* ────────────────────────────────────────────────────────────── */

function ChartCard({
  icon: Icon,
  title,
  description,
  children,
  isEmpty,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="opacity-60" />
      <CardContent className="p-4 md:p-5">
        {isEmpty ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có dữ liệu
            </p>
            <p className="max-w-[18rem] text-xs text-muted-foreground/80">
              Dữ liệu sẽ hiển thị khi bạn có lượt đặt sân.
            </p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Loading skeleton                                                */
/* ────────────────────────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[380px] w-full rounded-xl" />
        <Skeleton className="h-[380px] w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Main page                                                       */
/* ────────────────────────────────────────────────────────────── */

export function OwnerDashboardPage() {
  const { isLoading, error, dashboardStats, getStatsMetrics } =
    useComplexStore();
  const { user: owner } = useAuthStore();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    getStatsMetrics();
  }, [getStatsMetrics]);

  useEffect(() => {
    ownerService
      .getStripeStatus()
      .then((data) => {
        setIsConnected(data.data.isComplete);
      })
      .catch((err) => {
        toast.error(
          "Đã có lỗi xảy ra khi kiểm tra trạng thái kết nối Stripe. Vui lòng thử lại sau.",
        );
        console.error("Lỗi khi lấy trạng thái Stripe:", err);
      });
  }, []);

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

  const currentDate = format(new Date(), "EEEE, d MMMM, yyyy", { locale: vi });

  const bookingStatusData = useMemo(() => {
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

  const handleConnectStripe = async () => {
    try {
      const data = await ownerService.createStripeLink();
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(
        "Đã có lỗi xảy ra khi kết nối với Stripe. Vui lòng thử lại sau.",
      );
      console.error("Lỗi kết nối Stripe:", err);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-accent-sport/5 px-4 py-3.5 shadow-sm md:px-6 md:py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-8 size-32 rounded-full bg-accent-sport/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
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
                  Ví chưa kết nối
                </Badge>
              )}
            </div>

            <h1 className="truncate font-display text-xl font-black leading-tight tracking-tight text-foreground md:text-2xl">
              Xin chào,{" "}
              <span className="italic text-primary">
                {owner?.full_name || "Chủ sân"}
              </span>
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isConnected ? (
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
                Kết nối ví
                <ArrowRight
                  data-icon="inline-end"
                  className="transition-transform group-hover/cta:translate-x-0.5"
                />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Tổng doanh thu"
          value={stats.totalRevenue.toLocaleString()}
          unit="đ"
          tone="primary"
          delta={{
            kind: "percent",
            value: stats.revenueGrowth,
            hint: "so với tháng trước",
          }}
        />
        <StatCard
          icon={Calendar}
          label="Lượt đặt sân"
          value={stats.totalBookings.toLocaleString()}
          tone="sport"
          delta={{
            kind: "count",
            value: stats.newBookingsThisWeek,
            hint: "lượt đặt mới tuần này",
          }}
        />
        <StatCard
          icon={Building2}
          label="Khu phức hợp"
          value={stats.totalComplexes.toLocaleString()}
          tone="amber"
          delta={{
            kind: "count",
            value: stats.activeSubFields,
            hint: "sân đang hoạt động",
          }}
        />
        <StatCard
          icon={Users}
          label="Khách hàng"
          value={stats.totalCustomers.toLocaleString()}
          tone="rose"
          delta={{
            kind: "count",
            value: stats.newCustomers,
            hint: "khách hàng mới",
          }}
        />
      </section>

      {/* ── CHARTS ROW 1 ───────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          icon={PieChartIcon}
          title="Phân bố trạng thái booking"
          description="Tình trạng các lượt đặt sân hiện tại"
          isEmpty={bookingStatusData.length === 0}
        >
          <ChartContainer
            config={{
              "Chờ xác nhận": { label: "Chờ xác nhận", color: "#10b981" },
              "Đã xác nhận": { label: "Đã xác nhận", color: "#3b82f6" },
              "Chưa thanh toán": { label: "Chưa thanh toán", color: "#f59e0b" },
              "Đã hủy": { label: "Đã hủy", color: "#ef4444" },
            }}
            className="h-[300px] w-full"
          >
            <PieChart>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="confirmedGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="cancelledGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
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
                data={bookingStatusData}
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
                }) =>
                  `${props.payload?.status || props.name}: ${props.value}`
                }
              />
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          icon={BarChart3}
          title="Top sân đặt nhiều nhất"
          description="5 sân có lượt đặt cao nhất"
          isEmpty={topSubFieldsData.length === 0}
        >
          <ChartContainer
            config={{
              bookings: { label: "Lượt đặt", color: "#8b5cf6" },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={topSubFieldsData}>
              <defs>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
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
          <ChartContainer
            config={{
              revenue: { label: "Doanh thu", color: "#f97316" },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={revenueByComplexData} layout="vertical">
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                fontSize={11}
                width={100}
                tickLine={false}
                axisLine={false}
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
        </ChartCard>

        <ChartCard
          icon={Clock3}
          title="Phân bố theo khung giờ"
          description="Lượt đặt sân theo từng giờ trong ngày"
          isEmpty={hourlyDistributionData.length === 0}
        >
          <ChartContainer
            config={{
              bookings: { label: "Lượt đặt", color: "#06b6d4" },
            }}
            className="h-[300px] w-full"
          >
            <AreaChart data={hourlyDistributionData}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
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
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBookings)"
              />
            </AreaChart>
          </ChartContainer>
        </ChartCard>
      </section>
    </div>
  );
}
