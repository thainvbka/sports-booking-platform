import type { RatingDistributionPoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingDistributionProps {
  data: RatingDistributionPoint[];
  avgRating: number;
}

export function RatingDistribution({ data, avgRating }: RatingDistributionProps) {
  const totalRatings = data.reduce((s, r) => s + r.count, 0);
  const maxRatCount = Math.max(...data.map(r => r.count), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 pt-4 px-6">
        <CardTitle className="text-lg">Satisfaction</CardTitle>
        <CardDescription className="text-[11px]">User rating distribution (Last 30 days)</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl font-black tracking-tighter leading-none">{avgRating}</span>
          <div className="flex flex-col">
            <div className="flex text-amber-500 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-3 w-3 ${i <= Math.round(avgRating) ? "fill-current" : "text-slate-200"}`} />
              ))}
            </div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{totalRatings} REVIEWS</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = data.find(r => r.star === star)?.count ?? 0;
            const color = star >= 4 ? "bg-emerald-500" : star === 3 ? "bg-amber-500" : "bg-rose-500";
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-2 shrink-0">{star}</span>
                <Progress 
                  value={(count / maxRatCount) * 100} 
                  className="h-1.5 flex-1" 
                  indicatorClassName={color}
                />
                <span className="text-[10px] font-bold text-foreground w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
