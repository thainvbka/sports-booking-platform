import type { SubField, PricingRule } from "@/types";
import { formatTime, parseRuleTimeToMinutes } from "./time.utils";

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

export type PricingTier = "PEAK" | "BUDGET" | "REGULAR";

export interface PricingTierConfig {
  label: string;
  subLabel: string;
  badgeClass: string;
  textClass: string;
  colorClass: string;
  cardClass: string;
  solidBadgeClass: string;
}

export const PRICING_TIER_CONFIGS: Record<PricingTier, PricingTierConfig> = {
  PEAK: {
    label: "Giờ cao điểm",
    subLabel: "cao điểm",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400",
    textClass: "text-orange-600 dark:text-orange-400",
    colorClass: "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white",
    cardClass: "border-orange-200 bg-orange-50/20 dark:border-orange-900/30 dark:bg-orange-950/10",
    solidBadgeClass: "border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  BUDGET: {
    label: "Giá tiết kiệm",
    subLabel: "tiết kiệm nhất",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400",
    textClass: "text-emerald-600 dark:text-emerald-400",
    colorClass: "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white",
    cardClass: "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10",
    solidBadgeClass: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REGULAR: {
    label: "Giờ thường",
    subLabel: "bình thường",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400",
    textClass: "text-blue-600 dark:text-blue-400",
    colorClass: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white",
    cardClass: "border-blue-200 bg-blue-50/20 dark:border-blue-900/30 dark:bg-blue-950/10",
    solidBadgeClass: "border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
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
