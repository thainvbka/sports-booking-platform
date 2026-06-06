import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TopComplexPoint } from "@/types/admin.types";
import { formatPrice } from "@/utils";
import { Medal, Trophy } from "lucide-react";

interface TopComplexesProps {
  data: TopComplexPoint[];
}

const RANK_CONFIG = [
  {
    Icon: Trophy,
    iconBg:
      "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm shadow-amber-200/60 dark:shadow-amber-900/40",
    iconText: "text-amber-950",
    cardBg:
      "border-amber-200/80 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/10",
  },
  {
    Icon: Medal,
    iconBg:
      "bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 shadow-sm shadow-slate-200/60 dark:shadow-slate-700/40",
    iconText: "text-slate-800 dark:text-slate-100",
    cardBg:
      "border-slate-200 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-800/10",
  },
  {
    Icon: Medal,
    iconBg:
      "bg-gradient-to-br from-orange-400 to-amber-600 shadow-sm shadow-orange-200/60 dark:shadow-orange-900/40",
    iconText: "text-orange-950",
    cardBg:
      "border-orange-100 dark:border-orange-900/30 bg-orange-50/20 dark:bg-orange-950/5",
  },
];

const BAR_GRADIENTS = [
  "from-amber-400 via-yellow-400 to-amber-500",
  "from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600",
  "from-orange-400 to-amber-500",
  "from-primary/80 to-primary",
  "from-primary/60 to-primary/80",
];

export function TopComplexes({ data }: TopComplexesProps) {
  const maxRevenue = Math.max(...data.map((c) => c.revenue), 1);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4 pt-5 px-6">
        <CardTitle className="text-lg">Cụm sân doanh thu tốt nhất</CardTitle>
        <CardDescription className="text-[11px]">
          Dẫn đầu về doanh thu & tỷ lệ lấp đầy
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-5">
        <div className="space-y-3">
          {data.map((c, i) => {
            const rank = RANK_CONFIG[i] ?? null;
            const RankIcon = rank?.Icon ?? null;
            const barGradient = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
            const revPct = (c.revenue / maxRevenue) * 100;
            const stars =
              "★".repeat(Math.round(c.avgRating)) +
              "☆".repeat(5 - Math.round(c.avgRating));

            return (
              <div
                key={c.name}
                className={`group p-3.5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  rank
                    ? rank.cardBg
                    : "border-muted/60 dark:border-slate-800 bg-muted/10 hover:bg-card"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {rank && RankIcon ? (
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${rank.iconBg}`}
                      >
                        <RankIcon className={`h-3.5 w-3.5 ${rank.iconText}`} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-background border border-muted text-[11px] font-black text-muted-foreground">
                        {i + 1}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold tracking-tight leading-none mb-1.5">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-amber-500 tracking-tight">
                          {stars}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {c.bookings} lượt đặt
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-foreground tracking-tight">
                      {formatPrice(c.revenue)}
                    </p>
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none mt-1"
                    >
                      {c.utilizationRate}% lấp đầy
                    </Badge>
                  </div>
                </div>

                {/* Gradient progress bar */}
                <div className="relative h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700`}
                    style={{ width: `${revPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
