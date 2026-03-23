import { toZonedTime } from "date-fns-tz";

export const TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Chuẩn hóa mọi mốc thời gian về số phút trong ngày theo giờ Việt Nam.
 * - Đầu vào: Date Object (bất kể múi giờ nào).
 * - Đầu ra: Số phút từ 0h sáng VN (VD: 17:30 VN → 1050 phút).
 * - Dùng cho: so sánh booking time với pricing rule.
 */
export const getVietnamMinutes = (date: Date): number => {
  const vnDate = toZonedTime(date, TIME_ZONE);
  return vnDate.getHours() * 60 + vnDate.getMinutes();
};

/**
 * Lấy thứ trong tuần theo giờ Việt Nam.
 * - Trả về: 0 (Chủ nhật) → 6 (Thứ 7)
 */
export const getVietnamDayOfWeek = (date: Date): number => {
  const vnDate = toZonedTime(date, TIME_ZONE);
  return vnDate.getDay();
};

/**
 * Lấy số phút thô từ Date object theo UTC.
 * - Dùng cho: PricingRule (@db.Time) — Prisma lưu "face value" trong UTC.
 * - VD: rule lưu "08:00" → Prisma trả 1970-01-01T08:00:00Z → getUTCHours() = 8 ✓
 */
export const getRawMinutes = (date: Date): number => {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

/**
 * Format HH:MM theo giờ Việt Nam — dùng cho error messages.
 */
export const formatVietnamTime = (date: Date): string => {
  const vnDate = toZonedTime(date, TIME_ZONE);
  const hours = String(vnDate.getHours()).padStart(2, "0");
  const minutes = String(vnDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Format HH:MM theo UTC — dùng cho PricingRule face value.
 */
export const formatTimeForDisplay = (date: Date): string => {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
