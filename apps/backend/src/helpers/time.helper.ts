import { toZonedTime } from "date-fns-tz";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Hàm này giúp "chuẩn hóa" mọi mốc thời gian về số phút trong ngày theo giờ Việt Nam.
 * - Đầu vào: Date Object (Bất kể là năm 1970 hay 2025, bất kể đang là giờ UTC nào).
 * - Đầu ra: Số phút từ 0h sáng VN (Ví dụ: 17:30 VN -> 1050 phút).
 * - Tác dụng: Giúp so sánh giờ giấc mà không quan tâm đến Ngày/Tháng/Năm.
 */
export const getVietnamMinutes = (date: Date): number => {
  // 1. Ép thời gian về múi giờ VN
  const vnDate = toZonedTime(date, TIME_ZONE);

  // 2. Tính tổng số phút (Giờ * 60 + Phút)
  return vnDate.getHours() * 60 + vnDate.getMinutes();
};

/**
 * Hàm lấy Thứ trong tuần theo giờ Việt Nam
 * - Trả về: 0 (Chủ nhật) -> 6 (Thứ 7)
 */
export const getVietnamDayOfWeek = (date: Date): number => {
  const vnDate = toZonedTime(date, TIME_ZONE);
  return vnDate.getDay();
};

/**
 *  Hàm lấy số phút thô từ Date object (theo giờ UTC)
 */
/**
 *  Hàm lấy số phút thô từ Date object (theo giờ UTC)
 *  Sử dụng UTC để đảm bảo lấy đúng "face value" của giờ lưu trong DB.
 */
export const getRawMinutes = (date: Date): number => {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

/**
 * Format time as HH:MM for display in error messages
 * Uses UTC to get the "face value" stored in DB
 */
export const formatTimeForDisplay = (date: Date): string => {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
