import type { ReactNode } from "react";
import { MapPin, Flag, Tag, Users } from "lucide-react";
import { SportType, type SportType as SportTypeValue } from "@/types";
import { formatPrice } from "./price.util";
import { getSportTypeLabel } from "./sport.util";

// ---------------------------------------------------------------------------
// Search page — URL param helpers
// ---------------------------------------------------------------------------

export type TabValue = "complexes" | "subfields";

export const ALL_SPORT_TYPES = new Set<string>(Object.values(SportType));

export const parseSportTypesFromParams = (
  params: URLSearchParams,
): SportTypeValue[] => {
  // Primary: comma-separated `sport_types`
  const csv = params.get("sport_types");
  if (csv) {
    const tokens = csv
      .split(",")
      .map((token) => token.trim())
      .filter((token) => ALL_SPORT_TYPES.has(token));
    if (tokens.length > 0) return tokens as SportTypeValue[];
  }

  // Legacy fallback: single `sport_type`
  const legacy = params.get("sport_type");
  if (legacy && ALL_SPORT_TYPES.has(legacy)) {
    return [legacy as SportTypeValue];
  }
  return [];
};

export const parseNumberParam = (
  params: URLSearchParams,
  key: string,
): number | undefined => {
  const raw = params.get(key);
  if (raw === null || raw === "") return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
};

// ---------------------------------------------------------------------------
// Search filters — value types & active-chip helpers
// ---------------------------------------------------------------------------

export interface SearchFiltersValue {
  location?: string;
  sportTypes: SportTypeValue[];
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

export type ChipKey = "location" | "sport_types" | "price" | "capacity";

export interface ActiveChip {
  key: ChipKey;
  label: string;
  icon?: ReactNode;
}

export function buildActiveChips(
  value: SearchFiltersValue,
  options: { hideCapacity?: boolean } = {},
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (value.location) {
    chips.push({
      key: "location",
      label: `"${value.location}"`,
      icon: <MapPin className="h-3 w-3" />,
    });
  }

  if (value.sportTypes.length > 0) {
    const label =
      value.sportTypes.length === 1
        ? getSportTypeLabel(value.sportTypes[0])
        : `${value.sportTypes.length} môn thể thao`;
    chips.push({
      key: "sport_types",
      label,
      icon: <Flag className="h-3 w-3" />,
    });
  }

  if (value.minPrice !== undefined || value.maxPrice !== undefined) {
    const parts: string[] = [];
    if (value.minPrice !== undefined) parts.push(`từ ${formatPrice(value.minPrice)}`);
    if (value.maxPrice !== undefined) parts.push(`đến ${formatPrice(value.maxPrice)}`);
    chips.push({
      key: "price",
      label: `Giá ${parts.join(" ")}`,
      icon: <Tag className="h-3 w-3" />,
    });
  }

  if (
    !options.hideCapacity &&
    (value.minCapacity !== undefined || value.maxCapacity !== undefined)
  ) {
    const parts: string[] = [];
    if (value.minCapacity !== undefined) parts.push(`${value.minCapacity}+`);
    if (value.maxCapacity !== undefined) parts.push(`≤ ${value.maxCapacity}`);
    chips.push({
      key: "capacity",
      label: `Sức chứa ${parts.join(" · ")}`,
      icon: <Users className="h-3 w-3" />,
    });
  }

  return chips;
}

export function countActiveFilters(
  value: SearchFiltersValue,
  options: { hideCapacity?: boolean } = {},
): number {
  let count = 0;
  if (value.sportTypes.length > 0) count += 1;
  if (value.minPrice !== undefined || value.maxPrice !== undefined) count += 1;
  if (
    !options.hideCapacity &&
    (value.minCapacity !== undefined || value.maxCapacity !== undefined)
  ) {
    count += 1;
  }
  return count;
}
