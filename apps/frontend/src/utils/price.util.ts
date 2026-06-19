import type { PricingRule, SubField } from "@/types";
import { formatTime, parseRuleTimeToMinutes } from "./time.util";

import type { PricingTier } from "@/constants";

export const getPriceRange = (
  subField: SubField,
): { min: number; max: number } => {
  if (!subField.pricing_rules || subField.pricing_rules.length === 0) {
    return { min: 0, max: 0 };
  }
  const prices = subField.pricing_rules.map((r) => Number(r.base_price));
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};


export const getRuleClassification = (
  rule: PricingRule,
  pricingRules: PricingRule[],
): PricingTier => {
  const rulePrice = Number(rule.base_price);
  const start = formatTime(rule.start_time);
  const startMins = parseRuleTimeToMinutes(start);
  const startHour = startMins !== null ? Math.floor(startMins / 60) : 0;

  // Peak time: start hour is between 17:00 and 22:00
  const isPeakTime = startHour >= 17 && startHour < 22;

  if (isPeakTime) {
    return "PEAK";
  }

  const prices = (pricingRules ?? []).map((r) => Number(r.base_price)).filter(Number.isFinite);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const hasPriceDifference = minPrice < maxPrice;

  if (hasPriceDifference && rulePrice === minPrice) {
    return "BUDGET";
  }

  return "REGULAR";
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
