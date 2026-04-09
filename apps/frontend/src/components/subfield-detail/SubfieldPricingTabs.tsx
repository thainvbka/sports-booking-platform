import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PricingRule } from "@/types";
import { formatMinutesToTime, parseRuleTimeToMinutes } from "@/utils/time.utils";
import { useEffect, useMemo, useState } from "react";

const dayNames: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

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
    <Tabs value={activePricingDay} onValueChange={setActivePricingDay}>
      <TabsList className="grid h-8 w-full grid-cols-7 gap-1 rounded-md bg-muted/50 p-1">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <TabsTrigger
            key={day}
            value={String(day)}
            className="h-6 rounded-sm px-1 text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-none sm:text-xs"
          >
            {dayTabLabels[day]}
          </TabsTrigger>
        ))}
      </TabsList>

      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
        <TabsContent key={day} value={String(day)} className="mt-3">
          <p className="mb-2 text-xs font-medium text-foreground/90">{dayNames[day]}</p>

          {rulesByDay[day].length > 0 ? (
            <div className="overflow-hidden rounded-md border border-border/70">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Khung giờ</th>
                    <th className="px-3 py-2 text-right font-medium">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {rulesByDay[day].map((rule) => (
                    <tr key={rule.id} className="border-t transition-colors hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium text-foreground/90">
                        {formatRuleTime(rule.start_time)} - {formatRuleTime(rule.end_time)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">
                        {Number(rule.base_price).toLocaleString("vi-VN")}đ/h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
              Chưa có bảng giá cho {dayNames[day]}.
            </p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );

  if (embedded) {
    return <div className={cn("space-y-3", className)}>{tabsContent}</div>;
  }

  return (
    <section className={cn("space-y-2", className)}>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-0.5 p-4 pb-2">
          <CardTitle className="text-base">Bảng giá theo ngày</CardTitle>
          <p className="text-xs text-muted-foreground">Giá theo khung giờ.</p>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-2">{tabsContent}</CardContent>
      </Card>
    </section>
  );
}
