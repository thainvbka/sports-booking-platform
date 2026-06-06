import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PricingRule } from "@/types";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const dayTabLabels: Record<number, string> = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
};

interface SubfieldPricingTabsProps {
  pricingRules: PricingRule[];
  className?: string;
  embedded?: boolean;
}

const formatRuleTime = (time: string | Date) => {
  const mins = parseRuleTimeToMinutes(time);
  if (mins === null) return "--:--";
  return formatMinutesToTime(mins);
};

export function SubfieldPricingTabs({
  pricingRules,
  className,
  embedded = false,
}: SubfieldPricingTabsProps) {
  const [activePricingDay, setActivePricingDay] = useState("0");

  const rulesByDay = useMemo(() => {
    const grouped: Record<number, PricingRule[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    for (const rule of pricingRules || []) {
      grouped[rule.day_of_week].push(rule);
    }

    for (const day of Object.keys(grouped)) {
      grouped[Number(day)] = grouped[Number(day)].sort((a, b) => {
        const aMin = parseRuleTimeToMinutes(a.start_time) ?? Number.MAX_SAFE_INTEGER;
        const bMin = parseRuleTimeToMinutes(b.start_time) ?? Number.MAX_SAFE_INTEGER;
        return aMin - bMin;
      });
    }

    return grouped;
  }, [pricingRules]);

  useEffect(() => {
    const firstDayWithRules = Object.keys(rulesByDay).find(
      (day) => rulesByDay[Number(day)].length > 0,
    );

    setActivePricingDay(firstDayWithRules || "0");
  }, [rulesByDay]);

  const tabsContent = (
    <Tabs
      value={activePricingDay}
      onValueChange={setActivePricingDay}
      className="gap-3"
    >
      <TabsList className="grid h-auto w-full grid-cols-7 gap-1 rounded-full bg-surface-2/70 p-1">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const hasRules = rulesByDay[day].length > 0;
          return (
            <TabsTrigger
              key={day}
              value={String(day)}
              className={cn(
                "relative h-8 rounded-full bg-transparent text-xs font-semibold text-muted-foreground transition-colors",
                "hover:text-foreground",
                "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm",
              )}
            >
              {dayTabLabels[day]}
              {hasRules ? (
                <span
                  aria-hidden
                  className="absolute right-1 top-1 size-1.5 rounded-full bg-accent-sport data-[state=active]:bg-accent-sport"
                />
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
        <TabsContent key={day} value={String(day)} className="m-0">
          {rulesByDay[day].length > 0 ? (
            <ul className="flex flex-col gap-2">
              {rulesByDay[day].map((rule) => (
                <li
                  key={rule.id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-surface-2/40"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-surface-2/60 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-display font-semibold tracking-tight tabular-nums">
                      {formatRuleTime(rule.start_time)}
                      <span className="mx-1 text-muted-foreground/50">→</span>
                      {formatRuleTime(rule.end_time)}
                    </span>
                  </span>
                  <span className="font-display text-sm font-black italic tracking-tight text-foreground tabular-nums">
                    {Number(rule.base_price).toLocaleString("vi-VN")}
                    <span className="ml-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground not-italic">
                      đ/h
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border/70 bg-surface-2/30 px-3 py-5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
                Nghỉ
              </span>
              <p className="text-sm text-muted-foreground">
                Chưa có bảng giá cho ngày này.
              </p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );

  if (embedded) {
    return <div className={cn("flex flex-col gap-3", className)}>{tabsContent}</div>;
  }

  return (
    <section className={cn(className)}>
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader className="gap-1 px-5 pt-5 pb-2">
          <CardTitle className="font-display text-base font-semibold">
            Bảng giá theo ngày
          </CardTitle>
          <p className="text-xs text-muted-foreground">Giá theo từng khung giờ.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-5 pt-1 pb-5">
          {tabsContent}
        </CardContent>
      </Card>
    </section>
  );
}
