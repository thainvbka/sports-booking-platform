import { SPORT_TYPE_LABELS } from "@/lib/constants";
import type { SportType } from "@/types";

export const getSportTypeLabel = (sportType: SportType | string): string => {
  return SPORT_TYPE_LABELS[sportType as SportType] || String(sportType);
};