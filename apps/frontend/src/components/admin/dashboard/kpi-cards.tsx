import { TrendBadge } from "@/components/admin/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtVND } from "@/lib/format";
import type { AdminKpis } from "@/types/admin.types";
import { Calendar, DollarSign, Star, Users } from "lucide-react";

interface KpiCardsProps {
  kpis: AdminKpis;
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* ── Revenue – hero dark card ── */}
        <Card className="relative overflow-hidden shadow-sm border border-blue-100/80 dark:border-blue-900/30 bg-white dark:bg-slate-900">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 leading-tight pt-0.5">
                Doanh thu tháng này
              </p>
              <div className="shrink-0 rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-[1.7rem] font-black tracking-tight leading-none mb-4 text-black">
              {fmtVND(kpis.revenue.thisMonth)}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <TrendBadge growth={kpis.revenue.growth} />
              <span className="text-[10px] text-slate-500 truncate">
                Tích lũy: {fmtVND(kpis.revenue.total || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Bookings ── */}
        <Card className="relative overflow-hidden shadow-sm border border-blue-100/80 dark:border-blue-900/30 bg-white dark:bg-slate-900">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-500/6 blur-2xl pointer-events-none" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-tight pt-0.5">
                Lượt đặt sân tháng này
              </p>
              <div className="shrink-0 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 p-2.5">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <p className="text-[1.7rem] font-black tracking-tight leading-none mb-4 text-foreground">
              {kpis.bookings.thisMonth.toLocaleString()}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <TrendBadge growth={kpis.bookings.growth} />
              <span className="text-[10px] text-muted-foreground">
                Tổng: {(kpis.bookings.total || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Users ── */}
        <Card className="relative overflow-hidden shadow-sm border border-emerald-100/80 dark:border-emerald-900/30 bg-white dark:bg-slate-900">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/6 blur-2xl pointer-events-none" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-tight pt-0.5">
                Tài khoản đăng ký mới
              </p>
              <div className="shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 p-2.5">
                <Users className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-[1.7rem] font-black tracking-tight leading-none mb-4 text-foreground">
              {kpis.users.thisMonth.toLocaleString()}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <TrendBadge growth={kpis.users.growth} />
              <span className="text-[10px] text-muted-foreground">
                Tổng tài khoản: {(kpis.users.total || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── System quality ── */}
        <Card className="relative overflow-hidden shadow-sm border border-amber-100/80 dark:border-amber-900/30 bg-white dark:bg-slate-900">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-500/6 blur-2xl pointer-events-none" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 leading-tight pt-0.5">
                Chất lượng hệ thống
              </p>
              <div className="shrink-0 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 p-2.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-[1.7rem] font-black tracking-tight leading-none text-foreground">
                {kpis.avgRating.toFixed(1)}
              </p>
              <span className="text-sm text-muted-foreground">/ 5.0</span>
              <div className="flex text-amber-400 gap-0.5 ml-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i <= Math.round(kpis.avgRating) ? "fill-current" : "opacity-20"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Cụm sân trên hệ thống:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-foreground text-sm">
                  {kpis.complexes.total}
                </span>
                {kpis.complexes.pending > 0 && (
                  <Badge className="h-4 px-1.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40">
                    {kpis.complexes.pending} chờ duyệt
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
