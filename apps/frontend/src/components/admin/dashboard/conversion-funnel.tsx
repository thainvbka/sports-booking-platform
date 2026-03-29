import type { ConversionFunnelPoint } from "@/types/admin.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const fmtPct = (n: number) => `${Number(n).toFixed(1)}%`;

interface ConversionFunnelProps {
  data: ConversionFunnelPoint[];
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const stages = data.filter(d => d.stage !== "Canceled");
  const canceled = data.find(d => d.stage === "Canceled");
  const maxVal = stages[0]?.value || 1;
  
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500"
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4 pt-4 px-5">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Funnel Efficiency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-4">
        {stages.map((item, i) => {
          const next = stages[i + 1];
          const percentage = (item.value / maxVal) * 100;
          const drop = next ? Math.round(((item.value - next.value) / item.value) * 100) : null;
          
          return (
            <div key={item.stage} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-muted-foreground">{item.stage}</span>
                <span className="text-foreground">{item.value.toLocaleString()}</span>
              </div>
              <div className="relative">
                <Progress value={percentage} className={`h-1.5 ${colors[i % colors.length]}`} />
                <div className="absolute right-0 top-[-14px] text-[9px] font-bold text-muted-foreground/60">
                  {fmtPct(item.dropOffPct === 0 ? 100 : 100 - item.dropOffPct)}
                </div>
              </div>
              {drop != null && (
                <div className="flex justify-end pt-0.5">
                  <span className="text-[8px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1 rounded-sm">
                    −{drop}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
        
        {canceled && (
          <div className="mt-4 p-3 bg-rose-50/50 dark:bg-rose-950/10 rounded-lg border border-rose-100 dark:border-rose-900/20 flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest leading-none">Loss Rate</p>
              <p className="text-lg font-bold text-rose-700 leading-none">{canceled.value.toLocaleString()}</p>
            </div>
            <Badge variant="outline" className="text-[9px] h-4 px-1 border-rose-200 text-rose-600 font-bold">{fmtPct(canceled.dropOffPct)}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
