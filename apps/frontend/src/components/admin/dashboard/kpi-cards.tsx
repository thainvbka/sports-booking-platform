import { TrendBadge } from "@/components/admin/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils";
import type { AdminKpis } from "@/types/admin.types";
import type { LucideIcon } from "lucide-react";
import { Calendar, DollarSign, Star, Users } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardsProps {
  kpis: AdminKpis;
}

type AccentKey = "emerald" | "blue" | "violet" | "amber";

const ACCENT: Record<
  AccentKey,
  {
    bar: string;
    blob: string;
    ring: string;
    icon: string;
    iconWrap: string;
    eyebrow: string;
  }
> = {
  emerald: {
    bar: "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400",
    blob: "bg-emerald-500/10",
    ring: "hover:border-emerald-300/70 dark:hover:border-emerald-700/60",
    icon: "text-emerald-600 dark:text-emerald-400",
    iconWrap:
      "bg-emerald-50 border-emerald-200/70 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    eyebrow: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    bar: "bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500",
    blob: "bg-blue-500/10",
    ring: "hover:border-blue-300/70 dark:hover:border-blue-700/60",
    icon: "text-blue-600 dark:text-blue-400",
    iconWrap:
      "bg-blue-50 border-blue-200/70 dark:bg-blue-500/10 dark:border-blue-500/30",
    eyebrow: "text-muted-foreground",
  },
  violet: {
    bar: "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
    blob: "bg-violet-500/10",
    ring: "hover:border-violet-300/70 dark:hover:border-violet-700/60",
    icon: "text-violet-600 dark:text-violet-400",
    iconWrap:
      "bg-violet-50 border-violet-200/70 dark:bg-violet-500/10 dark:border-violet-500/30",
    eyebrow: "text-muted-foreground",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400",
    blob: "bg-amber-500/10",
    ring: "hover:border-amber-300/70 dark:hover:border-amber-700/60",
    icon: "text-amber-600 dark:text-amber-400",
    iconWrap:
      "bg-amber-50 border-amber-200/70 dark:bg-amber-500/10 dark:border-amber-500/30",
    eyebrow: "text-amber-600 dark:text-amber-400",
  },
};

interface KpiCardProps {
  accent: AccentKey;
  label: string;
  Icon: LucideIcon;
  iconFill?: boolean;
  value: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
}

function KpiCard({
  accent,
  label,
  Icon,
  iconFill = false,
  value,
  footerLeft,
  footerRight,
}: KpiCardProps) {
  const a = ACCENT[accent];
  return (
    <Card
      className={cn(
        "relative overflow-hidden gap-0 p-0 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        a.ring,
      )}
    >
      {/* top accent bar */}
      <div aria-hidden className={cn("h-[3px] w-full", a.bar)} />
      {/* ambient blob */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-10 -top-6 size-32 rounded-full blur-2xl",
          a.blob,
        )}
      />

      <CardContent className="relative z-10 flex flex-col gap-4 p-5">
        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "pt-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em]",
              a.eyebrow,
            )}
          >
            {label}
          </p>
          <div
            className={cn(
              "shrink-0 rounded-xl border p-2.5",
              a.iconWrap,
            )}
          >
            <Icon
              className={cn("size-4", a.icon, iconFill && "fill-current")}
            />
          </div>
        </div>

        {/* value */}
        <div className="text-[1.75rem] font-black leading-none tracking-tight text-foreground">
          {value}
        </div>

        {/* footer row */}
        <div className="flex min-h-[22px] items-center justify-between gap-2">
          <div className="min-w-0">{footerLeft}</div>
          <div className="shrink-0 truncate text-right text-[10px] text-muted-foreground">
            {footerRight}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* Revenue */}
      <KpiCard
        accent="emerald"
        label="Doanh thu tháng này"
        Icon={DollarSign}
        value={formatPrice(kpis.revenue.thisMonth)}
        footerLeft={<TrendBadge growth={kpis.revenue.growth} />}
        footerRight={<>Tích lũy {formatPrice(kpis.revenue.total || 0)}</>}
      />

      {/* Bookings */}
      <KpiCard
        accent="blue"
        label="Lượt đặt sân tháng này"
        Icon={Calendar}
        value={kpis.bookings.thisMonth.toLocaleString()}
        footerLeft={<TrendBadge growth={kpis.bookings.growth} />}
        footerRight={<>Tổng {(kpis.bookings.total || 0).toLocaleString()}</>}
      />

      {/* Users */}
      <KpiCard
        accent="violet"
        label="Tài khoản đăng ký mới"
        Icon={Users}
        value={kpis.users.thisMonth.toLocaleString()}
        footerLeft={<TrendBadge growth={kpis.users.growth} />}
        footerRight={
          <>Tổng {(kpis.users.total || 0).toLocaleString()} tài khoản</>
        }
      />

      {/* Rating / System quality */}
      <KpiCard
        accent="amber"
        label="Chất lượng hệ thống"
        Icon={Star}
        iconFill
        value={
          <div className="flex items-baseline gap-2">
            <span>{kpis.avgRating.toFixed(1)}</span>
            <span className="text-sm font-semibold text-muted-foreground">
              / 5.0
            </span>
            <div className="ml-auto flex gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3",
                    i <= Math.round(kpis.avgRating)
                      ? "fill-current"
                      : "opacity-20",
                  )}
                />
              ))}
            </div>
          </div>
        }
        footerLeft={
          <span className="text-[10px] font-semibold text-muted-foreground">
            {kpis.complexes.total} cụm sân trên hệ thống
          </span>
        }
        footerRight={
          kpis.complexes.pending > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300"
            >
              {kpis.complexes.pending} chờ duyệt
            </Badge>
          ) : null
        }
      />
    </div>
  );
}
