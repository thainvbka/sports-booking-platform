import { DollarSign, Calendar, Building2, Users } from "lucide-react";
import { StatCard } from "../StatCard";
import { formatPrice } from "@/utils";

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    newBookingsThisWeek: number;
    totalComplexes: number;
    activeSubFields: number;
    totalCustomers: number;
    newCustomers: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={DollarSign}
        label="Tổng doanh thu"
        value={formatPrice(stats.totalRevenue)}
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
  );
}
