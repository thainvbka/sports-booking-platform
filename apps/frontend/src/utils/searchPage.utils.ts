import { SportType, type SportType as SportTypeValue } from "@/types";

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
