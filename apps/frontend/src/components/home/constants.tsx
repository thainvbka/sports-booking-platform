import { SPORT_TYPE_LABELS } from "@/lib/constants";
import { SportType, SportType as SportTypeValue } from "@/types";
import { getSportTypeEmoji } from "@/utils/sport";

export interface HomeSportCategory {
  name: string;
  emoji: string;
  type: SportType;
  courtCount: number;
  tagline: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export const SPORT_TYPE_OPTIONS = Object.values(SportTypeValue) as SportType[];

export const parseSportType = (value: string): SportType | "ALL" => {
  if (value === "ALL") {
    return "ALL";
  }

  return SPORT_TYPE_OPTIONS.find((sportType) => sportType === value) ?? "ALL";
};

export const SPORT_TAGLINES: Record<SportType, string> = {
  BADMINTON: "Indoor • Đèn LED",
  FOOTBALL: "Sân 5 / 7 / 11",
  PICKLEBALL: "Hot • Thịnh hành",
  TENNIS: "Clay • Hard court",
  BASKETBALL: "3x3 • Full court",
  VOLLEYBALL: "Sân tiêu chuẩn",
};

export const SPORT_CATEGORIES: HomeSportCategory[] = [
  SportTypeValue.BADMINTON,
  SportTypeValue.FOOTBALL,
  SportTypeValue.PICKLEBALL,
  SportTypeValue.TENNIS,
  SportTypeValue.BASKETBALL,
].map((type) => ({
  type,
  name: SPORT_TYPE_LABELS[type] || String(type),
  emoji: getSportTypeEmoji(type),
  courtCount: 0, 
  tagline: SPORT_TAGLINES[type] || "Tiêu chuẩn",
}));

export const HERO_STATS: HomeStat[] = [
  { value: "500+", label: "Sân đối tác" },
  { value: "50K+", label: "Người chơi" },
  { value: "100K+", label: "Lượt đặt sân" },
  { value: "4.8/5", label: "Đánh giá trung bình" },
];
