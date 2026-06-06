import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RatingDistributionPoint } from "@/types/admin.types";
import { Star } from "lucide-react";

interface RatingDistributionProps {
  data: RatingDistributionPoint[];
  avgRating: number;
}

const STAR_CONFIG: Record<
  number,
  { bar: string; text: string }
> = {
  5: { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-500" },
  4: { bar: "from-green-500 to-emerald-400", text: "text-green-500" },
  3: { bar: "from-amber-500 to-yellow-400", text: "text-amber-500" },
  2: { bar: "from-orange-500 to-amber-400", text: "text-orange-500" },
  1: { bar: "from-rose-600 to-red-500", text: "text-rose-600" },
};

export function RatingDistribution({
  data,
  avgRating,
}: RatingDistributionProps) {
  const totalRatings = data.reduce((s, r) => s + r.count, 0);
  const maxCount = Math.max(...data.map((r) => r.count), 1);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-lg">Mức độ hài lòng</CardTitle>
        <CardDescription className="text-[11px]">
          Phân bố đánh giá của người dùng (30 ngày gần nhất)
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-5 flex-1 flex flex-col justify-between gap-5">
        {/* Big rating display */}
        <div className="flex items-center gap-5 py-3 border-b border-muted/60">
          <div className="text-center shrink-0">
            <p className="text-5xl font-black tracking-tighter leading-none text-foreground">
              {avgRating}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              / 5.0
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 text-amber-400 ${i <= Math.round(avgRating) ? "fill-current" : "opacity-20"}`}
                />
              ))}
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground">
              {totalRatings.toLocaleString()} đánh giá
            </p>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.find((r) => r.star === star)?.count ?? 0;
            const pct =
              totalRatings > 0
                ? ((count / totalRatings) * 100).toFixed(0)
                : 0;
            const barW = (count / maxCount) * 100;
            const cfg = STAR_CONFIG[star];

            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 w-10 shrink-0">
                  <span className={`text-[11px] font-black ${cfg.text}`}>
                    {star}
                  </span>
                  <Star
                    className={`h-2.5 w-2.5 fill-current ${cfg.text}`}
                  />
                </div>

                <div className="relative flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`}
                    style={{ width: `${barW}%` }}
                  />
                </div>

                <div className="flex items-center gap-1 w-14 shrink-0 justify-end">
                  <span className="text-[10px] font-black text-foreground tabular-nums">
                    {count}
                  </span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
