import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABEL = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface HeatmapHourRow {
  hour: number | string;
  [day: string]: number | string;
}

interface DemandHeatmapProps {
  data: HeatmapHourRow[];
}

export function DemandHeatmap({ data }: DemandHeatmapProps) {
  const allVals = data.flatMap((r) => DAY_KEYS.map((k) => Number(r[k] ?? 0)));
  const maxVal = Math.max(...allVals, 1);

  const cellBg = (v: number) => {
    if (v === 0) return "bg-muted/20 dark:bg-muted/10";
    const t = v / maxVal;
    if (t < 0.2) return "bg-indigo-100 dark:bg-indigo-900/25";
    if (t < 0.4) return "bg-indigo-200 dark:bg-indigo-800/45";
    if (t < 0.6) return "bg-indigo-400 dark:bg-indigo-600/65";
    if (t < 0.8) return "bg-indigo-500 dark:bg-indigo-500/80";
    return "bg-indigo-600 dark:bg-indigo-400";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-lg">Mật độ nhu cầu</CardTitle>
        <CardDescription className="text-[11px]">
          Tần suất đặt sân theo giờ và ngày trong tuần
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-5">
        <TooltipProvider delayDuration={0}>
          <div className="w-full">
            {/* Day headers */}
            <div className="flex pl-9 mb-2">
              {DAY_LABEL.map((d) => (
                <div
                  key={d}
                  className="flex-1 text-center text-[9px] text-muted-foreground font-black uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            <div className="space-y-[3px]">
              {data.map((row) => (
                <div key={row.hour} className="flex items-center">
                  <span className="w-9 text-[9px] text-muted-foreground/70 text-right pr-2.5 shrink-0 font-mono font-bold leading-none">
                    {row.hour}h
                  </span>
                  <div className="flex flex-1 gap-[3px]">
                    {DAY_KEYS.map((k, di) => (
                      <Tooltip key={k}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex-1 h-3.5 rounded-[2px] cursor-crosshair transition-transform hover:scale-110 hover:z-10 ${cellBg(Number(row[k] ?? 0))}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-[10px] font-bold py-1 px-2.5 border-slate-800 bg-slate-900 text-white shadow-xl"
                        >
                          {DAY_KEYS[di]} {row.hour}:00 — {row[k] ?? 0} lượt
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-4 justify-end">
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Thưa
              </span>
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <div
                  key={t}
                  className={`w-3.5 h-2 rounded-[2px] ${cellBg(t * maxVal)}`}
                />
              ))}
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Dày
              </span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
