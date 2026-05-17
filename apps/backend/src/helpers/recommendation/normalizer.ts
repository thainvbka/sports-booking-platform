import { SportType } from "@prisma/client";

/**
 * Normalizes different features into a [0, 1] range for feature vectors.
 */

export const normalizeSport = (sport: SportType): number => {
  const sportMap: Record<SportType, number> = {
    [SportType.FOOTBALL]: 0.0,
    [SportType.BASKETBALL]: 0.2,
    [SportType.TENNIS]: 0.4,
    [SportType.BADMINTON]: 0.6,
    [SportType.VOLLEYBALL]: 0.8,
    [SportType.PICKLEBALL]: 1.0,
  };
  return sportMap[sport] ?? 0.5;
};

export const normalizeHour = (hour: number): number => {
  if (hour < 12) return 0.0;
  if (hour < 18) return 0.5;
  return 1.0;
};

export const normalizeWeekday = (ratio: number): number => {
  return Math.max(0, Math.min(ratio, 1));
};

export const normalizePrice = (
  value: number,
  min: number,
  max: number,
): number => {
  if (max === min) return 0.5;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(normalized, 1));
};

export const normalizeDistrict = (address: string): number => {
  // Mapping of districts based on seed data
  const districtMap: Record<string, number> = {
    "Quận 1": 0.0,
    "Quận 3": 0.1,
    "Quận 4": 0.2,
    "Quận 5": 0.3,
    "Quận 7": 0.4,
    "Quận 10": 0.5,
    "Quận 11": 0.6,
    "Quận 12": 0.7,
    "Quận Phú Nhuận": 0.8,
    "TP Thủ Đức": 0.9,
    "Quận Bình Thạnh": 1.0,
  };

  // Sort keys longest-first to avoid partial matches (e.g., "Quận 1" matching "Quận 10")
  const sortedKeys = Object.keys(districtMap).sort(
    (a, b) => b.length - a.length,
  );

  for (const key of sortedKeys) {
    if (address.includes(key)) {
      return districtMap[key];
    }
  }

  return 0.5; // fallback
};

export const normalizeRating = (avg: number | null): number => {
  const rating = avg ?? 3.5;
  return Math.max(0, Math.min(rating / 5, 1));
};

export const normalizeFrequency = (count: number, maxFrequency: number = 30): number => {
  if (maxFrequency === 0) return 0.5;
  return Math.max(0, Math.min(count / maxFrequency, 1));
};

export const normalizeRecency = (daysAgo: number): number => {
  return Math.max(0, Math.min(1 - daysAgo / 30, 1));
};
