import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABEL = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface DemandHeatmapProps {
  data: any[];
}

export function DemandHeatmap({ data }: DemandHeatmapProps) {
  const allVals = data.flatMap(r => DAY_KEYS.map(k => r[k] ?? 0));
  const maxVal = Math.max(...allVals, 1);

  const cellBg = (v: number) => {
    if (v === 0) return "bg-muted/20";
    const intensity = v / maxVal;
    if (intensity < 0.2) return "bg-blue-100 dark:bg-blue-900/20";
    if (intensity < 0.4) return "bg-blue-200 dark:bg-blue-800/40";
    if (intensity < 0.6) return "bg-blue-300 dark:bg-blue-700/60";
    if (intensity < 0.8) return "bg-blue-500 dark:bg-blue-600/80";
    return "bg-blue-600 dark:bg-blue-500";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 pt-4 px-6">
        <CardTitle className="text-lg">Demand Density</CardTitle>
        <CardDescription className="text-[11px]">Peak booking frequency by hour and day</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <TooltipProvider delayDuration={0}>
          <div className="w-full">
            <div className="flex pl-8 mb-1.5">
              {DAY_LABEL.map(d => (
                <div key={d} className="flex-1 text-center text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{d}</div>
              ))}
            </div>
            
            <div className="space-y-[2px]">
              {data.map(row => (
                <div key={row.hour} className="flex items-center">
                  <span className="w-8 text-[9px] text-muted-foreground/70 text-right pr-2 shrink-0 font-mono font-bold leading-none">
                    {row.hour}h
                  </span>
                  <div className="flex flex-1 gap-[2px]">
                    {DAY_KEYS.map((k, di) => (
                      <Tooltip key={k}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex-1 h-3.5 rounded-[1px] cursor-crosshair transition-all hover:scale-110 hover:z-10 ${cellBg(row[k] ?? 0)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] font-bold py-1 px-2 border-slate-800 bg-slate-900 text-white">
                          {DAY_KEYS[di]} {row.hour}:00 — {row[k] ?? 0} bk
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 mt-4 justify-end">
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Sparse</span>
              {[0, 0.25, 0.5, 0.75, 1].map(t => (
                <div key={t} className={`w-3 h-1.5 rounded-[1px] ${cellBg(t * maxVal)}`} />
              ))}
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Dense</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
