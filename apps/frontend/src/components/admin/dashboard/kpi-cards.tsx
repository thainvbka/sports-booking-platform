import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { AdminKpis, RevenueTrendPoint, RetentionPoint } from "@/types/admin.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Star } from "lucide-react";

const fmtVND = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

const Delta = ({ v }: { v: number }) => {
  const isPositive = v >= 0;
  return (
    <Badge variant={isPositive ? "default" : "destructive"} className="px-1 py-0 h-4 text-[9px] font-bold">
      {isPositive ? <TrendingUp className="mr-1 h-2.5 w-2.5" /> : <TrendingDown className="mr-1 h-2.5 w-2.5" />}
      {Math.abs(v).toFixed(1)}%
    </Badge>
  );
};

interface KpiCardsProps {
  kpis: AdminKpis;
  revenueTrend: RevenueTrendPoint[];
  retentionData: RetentionPoint[];
}

export function KpiCards({ kpis, revenueTrend, retentionData }: KpiCardsProps) {
  const items = [
    {
      title: "Revenue",
      value: fmtVND(kpis.revenue.thisMonth),
      growth: kpis.revenue.growth,
      data: revenueTrend,
      dataKey: "revenue",
      color: "hsl(var(--primary))",
      icon: DollarSign,
    },
    {
      title: "Bookings",
      value: kpis.bookings.thisMonth.toLocaleString(),
      growth: kpis.bookings.growth,
      data: revenueTrend,
      dataKey: "bookings",
      color: "#22c55e",
      icon: Calendar,
    },
    {
      title: "New Players",
      value: kpis.newUsers.thisMonth.toLocaleString(),
      growth: kpis.newUsers.growth,
      data: retentionData,
      dataKey: "new",
      color: "#8b5cf6",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{item.title}</CardTitle>
            <item.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold tracking-tight">{item.value}</div>
              <Delta v={item.growth} />
            </div>
            <div className="h-8 mt-2 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={item.data}>
                  <Area type="monotone" dataKey={item.dataKey} stroke={item.color} strokeWidth={1.5} fill={item.color} fillOpacity={0.05} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Quality</CardTitle>
          <Star className="h-3.5 w-3.5 text-amber-500" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight">{kpis.avgRating}</div>
            <div className="flex text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current opacity-30" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground border-t pt-2">
            <span>Upsell</span>
            <span className="text-emerald-600">{kpis.addonUpsell.revenueSharePct}% of total</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
