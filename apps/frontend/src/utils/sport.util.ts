import { SPORT_EMOJIS, SPORT_TYPE_LABELS } from "@/constants";
import type { SportType } from "@/types";

export const getSportTypeEmoji = (sportType: SportType | string): string => {
  return SPORT_EMOJIS[sportType as SportType] || "🔥";
};

export const getSportTypeLabel = (sportType: SportType | string): string => {
  return SPORT_TYPE_LABELS[sportType as SportType] || String(sportType);
};

export const sportLabel = (sportType: unknown): string => {
  const str = String(sportType);
  const label = getSportTypeLabel(str);
  return label === str ? "Không xác định" : label;
};