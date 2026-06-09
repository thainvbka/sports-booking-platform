import { SportType } from "@prisma/client";

export const SPORT_NAME_MAP: Record<SportType, string> = {
  [SportType.BADMINTON]: "Cầu lông",
  [SportType.FOOTBALL]: "Bóng đá",
  [SportType.BASKETBALL]: "Bóng rổ",
  [SportType.TENNIS]: "Tennis",
  [SportType.VOLLEYBALL]: "Bóng chuyền",
  [SportType.PICKLEBALL]: "Pickleball",
};

export const translatePreferredTime = (avgHour: number): string => {
  if (avgHour < 12) return "Buổi sáng (trước 12h)";
  if (avgHour < 18) return "Buổi chiều (12h - 18h)";
  return "Buổi tối (sau 18h)";
};

export const translatePreferredDays = (weekendRatio: number): string => {
  if (weekendRatio > 0.6) return "Cuối tuần (Thứ 7, Chủ Nhật)";
  if (weekendRatio < 0.4) return "Ngày thường (Thứ 2 - Thứ 6)";
  return "Linh hoạt cả tuần";
};
