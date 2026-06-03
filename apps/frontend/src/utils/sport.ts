import { SPORT_TYPE_LABELS } from "@/lib/constants";
import type { SportType } from "@/types";

export const SPORT_EMOJIS: Record<SportType, string> = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  BADMINTON: "🏸",
  VOLLEYBALL: "🏐",
  PICKLEBALL: "🏓",
};

export const getSportTypeEmoji = (sportType: SportType | string): string => {
  return SPORT_EMOJIS[sportType as SportType] || "🔥";
};

export const getSportTypeLabel = (sportType: SportType | string): string => {
  return SPORT_TYPE_LABELS[sportType as SportType] || String(sportType);
};