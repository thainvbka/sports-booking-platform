import type { TopComplexPoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fmtVND = (n: number) => `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

interface TopComplexesProps {
  data: TopComplexPoint[];
}

export function TopComplexes({ data }: TopComplexesProps) {
  const maxRevenue = Math.max(...data.map(c => c.revenue), 1);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-lg">Top Performing Complexes</CardTitle>
          <CardDescription className="text-[11px]">Revenue leaders & utilization metrics</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="grid gap-3">
          {data.map((c, i) => {
            const stars = "★".repeat(Math.round(c.avgRating)) + "☆".repeat(5 - Math.round(c.avgRating));
            const isTop = i === 0;
            
            return (
              <div key={c.name} className="group p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-muted/20 hover:bg-card transition-all duration-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${isTop ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border text-muted-foreground"}`}>
                      {isTop ? <Trophy className="h-3 w-3" /> : i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight leading-none mb-1">{c.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-500 tracking-tighter">{stars}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">{c.bookings} bk</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground tracking-tight">{fmtVND(c.revenue)}</p>
                    <Badge variant="secondary" className="h-3.5 px-1 rounded-sm text-[8px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
                      {c.utilizationRate}% Util
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(c.revenue / maxRevenue) * 100} 
                  className="h-1" 
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
