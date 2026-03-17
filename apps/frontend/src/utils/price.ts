import type { SubField } from "@/types";

export const getPriceRange = (
  subField: SubField,
): { min: number; max: number } => {
  if (!subField.pricing_rules || subField.pricing_rules.length === 0) {
    return { min: 0, max: 0 };
  }
  const prices = subField.pricing_rules.map((r) => r.base_price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};
