import type { PricingRule } from "@/types";
import {
  formatMinutesToTime,
  parseRuleTimeToMinutes,
} from "@/utils/time.util";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PriceBreakdownItem {
  rule: string;
  duration: number;
  price: number;
}

interface PriceCalculation {
  totalPrice: number;
  breakdown: PriceBreakdownItem[] | null;
}

interface UseBookingTimePricingOptions {
  date?: Date;
  pricingRules: PricingRule[];
  initialStartTime?: string;
  initialEndTime?: string;
}

interface UseBookingTimePricingResult {
  customStartTime: string;
  customEndTime: string;
  availableRules: PricingRule[];
  timeOptions: string[];
  priceCalculation: PriceCalculation;
  setCustomStartTime: (value: string) => void;
  setCustomEndTime: (value: string) => void;
  validateCustomTime: () => boolean;
}

export function useBookingTimePricing({
  date,
  pricingRules,
  initialStartTime,
  initialEndTime,
}: UseBookingTimePricingOptions): UseBookingTimePricingResult {
  const [customStartTime, setCustomStartTimeState] = useState("");
  const [customEndTime, setCustomEndTimeState] = useState("");
  const [hasAppliedInitial, setHasAppliedInitial] = useState(false);

  const toMinutes = useCallback((time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }, []);

  const availableRules = useMemo(() => {
    if (!date) return [];

    return (pricingRules || [])
      .filter((rule) => rule.day_of_week === date.getDay())
      .sort((a, b) => {
        const aMin = parseRuleTimeToMinutes(a.start_time) ?? Number.MAX_SAFE_INTEGER;
        const bMin = parseRuleTimeToMinutes(b.start_time) ?? Number.MAX_SAFE_INTEGER;
        return aMin - bMin;
      });
  }, [pricingRules, date]);

  const timeOptions = useMemo(() => {
    if (availableRules.length === 0 || !date) return [];

    const allTimes = availableRules.flatMap((rule) => {
      const start = parseRuleTimeToMinutes(rule.start_time);
      const end = parseRuleTimeToMinutes(rule.end_time);
      if (start === null || end === null) return [];
      return [start, end];
    });

    if (!allTimes.length) return [];

    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    let effectiveStartMin = minTime;
    const now = new Date();
    const isToday = format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    if (isToday) {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const nextSlot = Math.ceil(currentMin / 30) * 30;
      effectiveStartMin = Math.max(minTime, nextSlot);
    }

    const isWithinAnyRule = (min: number) =>
      availableRules.some((rule) => {
        const rStart = parseRuleTimeToMinutes(rule.start_time);
        const rEnd = parseRuleTimeToMinutes(rule.end_time);
        if (rStart === null || rEnd === null) return false;
        return min >= rStart && min < rEnd;
      });

    const options: string[] = [];

    for (let min = effectiveStartMin; min <= maxTime; min += 30) {
      const isBoundary = availableRules.some((rule) => {
        const rEnd = parseRuleTimeToMinutes(rule.end_time);
        return rEnd === min;
      });

      if (isWithinAnyRule(min) || isBoundary) {
        options.push(formatMinutesToTime(min));
      }
    }

    return options;
  }, [availableRules, date]);

  useEffect(() => {
    if (timeOptions.length >= 2) {
      if (!hasAppliedInitial && initialStartTime && initialEndTime) {
        setHasAppliedInitial(true);
        if (timeOptions.includes(initialStartTime)) {
          setCustomStartTimeState(initialStartTime);
        } else {
          setCustomStartTimeState(timeOptions[0]);
        }
        if (timeOptions.includes(initialEndTime)) {
          setCustomEndTimeState(initialEndTime);
        } else {
          setCustomEndTimeState(timeOptions[1]);
        }
        return;
      }

      setCustomStartTimeState((prev) =>
        prev && timeOptions.includes(prev) ? prev : timeOptions[0],
      );

      setCustomEndTimeState((prev) => {
        if (prev && timeOptions.includes(prev)) return prev;
        return timeOptions[1];
      });

      return;
    }

    setCustomStartTimeState("");
    setCustomEndTimeState("");
  }, [timeOptions, initialStartTime, initialEndTime, hasAppliedInitial]);

  const setCustomStartTime = useCallback(
    (value: string) => {
      setCustomStartTimeState(value);

      setCustomEndTimeState((currentEnd) => {
        if (!currentEnd) {
          const firstValidEnd = timeOptions.find(
            (time) => toMinutes(time) > toMinutes(value),
          );
          return firstValidEnd || "";
        }

        if (toMinutes(currentEnd) > toMinutes(value)) {
          return currentEnd;
        }

        const nextValid = timeOptions.find((time) => toMinutes(time) > toMinutes(value));
        return nextValid || "";
      });
    },
    [timeOptions, toMinutes],
  );

  const setCustomEndTime = useCallback((value: string) => {
    setCustomEndTimeState(value);
  }, []);

  const priceCalculation = useMemo((): PriceCalculation => {
    if (!customStartTime || !customEndTime || availableRules.length === 0) {
      return { totalPrice: 0, breakdown: null };
    }

    const startMin = toMinutes(customStartTime);
    const endMin = toMinutes(customEndTime);

    let totalPrice = 0;
    let currentMin = startMin;
    const breakdown: PriceBreakdownItem[] = [];

    for (const rule of availableRules) {
      const ruleStartMin = parseRuleTimeToMinutes(rule.start_time);
      const ruleEndMin = parseRuleTimeToMinutes(rule.end_time);
      if (ruleStartMin === null || ruleEndMin === null) continue;

      const ruleDuration = ruleEndMin - ruleStartMin;
      if (ruleDuration <= 0) continue;

      const segmentStart = Math.max(currentMin, ruleStartMin);
      const segmentEnd = Math.min(endMin, ruleEndMin);

      if (segmentStart < segmentEnd) {
        const duration = segmentEnd - segmentStart;
        const price = Number(rule.base_price) * (duration / 60);

        totalPrice += price;
        breakdown.push({
          rule: `${formatMinutesToTime(ruleStartMin)}-${formatMinutesToTime(ruleEndMin)}`,
          duration,
          price,
        });

        currentMin = segmentEnd;
      }

      if (currentMin >= endMin) break;
    }

    if (currentMin < endMin) {
      return { totalPrice: 0, breakdown: null };
    }

    return { totalPrice, breakdown };
  }, [customStartTime, customEndTime, availableRules, toMinutes]);

  const validateCustomTime = useCallback(() => {
    if (!customStartTime || !customEndTime) return false;

    const startMin = toMinutes(customStartTime);
    const endMin = toMinutes(customEndTime);
    const duration = endMin - startMin;

    return (
      startMin % 30 === 0 &&
      endMin % 30 === 0 &&
      duration > 0 &&
      duration % 30 === 0
    );
  }, [customStartTime, customEndTime, toMinutes]);

  return {
    customStartTime,
    customEndTime,
    availableRules,
    timeOptions,
    priceCalculation,
    setCustomStartTime,
    setCustomEndTime,
    validateCustomTime,
  };
}
