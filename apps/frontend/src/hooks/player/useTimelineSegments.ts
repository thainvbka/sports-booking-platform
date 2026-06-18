import type { PricingRule } from "@/types";
import { formatTime, getRuleClassification, parseRuleTimeToMinutes } from "@/utils";
import { useMemo } from "react";

export interface TimelineSegment {
  start: number;
  end: number;
  rule?: PricingRule;
  classification: "PEAK" | "BUDGET" | "REGULAR" | "CLOSED";
}

export function useTimelineSegments(pricingRules: PricingRule[]): TimelineSegment[] {
  return useMemo(() => {
    const rules = pricingRules ?? [];
    const subIntervals: { start: number; end: number; rule: PricingRule }[] = [];

    rules.forEach((rule) => {
      const start = formatTime(rule.start_time);
      const end = formatTime(rule.end_time);
      const startMins = parseRuleTimeToMinutes(start) ?? 0;
      const endMins = parseRuleTimeToMinutes(end) ?? 0;

      if (endMins < startMins) {
        subIntervals.push({ start: startMins, end: 1440, rule });
        subIntervals.push({ start: 0, end: endMins, rule });
      } else {
        subIntervals.push({ start: startMins, end: endMins, rule });
      }
    });

    subIntervals.sort((a, b) => a.start - b.start);

    const result: TimelineSegment[] = [];
    let current = 0;

    subIntervals.forEach((interval) => {
      if (interval.start > current) {
        result.push({
          start: current,
          end: interval.start,
          classification: "CLOSED",
        });
      }
      
      if (interval.start >= current) {
        result.push({
          start: interval.start,
          end: interval.end,
          rule: interval.rule,
          classification: getRuleClassification(interval.rule, pricingRules),
        });
        current = interval.end;
      }
    });

    if (current < 1440) {
      result.push({
        start: current,
        end: 1440,
        classification: "CLOSED",
      });
    }

    return result;
  }, [pricingRules]);
}
