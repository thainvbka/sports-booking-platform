import { SportType } from "@/types";

export const getSportTypeLabel = (sportType: SportType): string => {
  const labels: Record<SportType, string> = {
    [SportType.FOOTBALL]: "Bóng đá",
    [SportType.BASKETBALL]: "Bóng rổ",
    [SportType.TENNIS]: "Tennis",
    [SportType.BADMINTON]: "Cầu lông",
    [SportType.VOLLEYBALL]: "Bóng chuyền",
    [SportType.PICKLEBALL]: "Pickleball",
  };
  return labels[sportType];
};
