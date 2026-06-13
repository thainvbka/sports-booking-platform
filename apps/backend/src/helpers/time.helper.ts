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
 * Lấy số phút thô từ Date object.
 * - Dùng cho: PricingRule (@db.Time).
 */
export const getRawMinutes = (date: Date): number => {
  const year = date.getUTCFullYear();
  if (year === 1970 || year === 1969 || year === 2000) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }
  const vnDate = toZonedTime(date, TIME_ZONE);
  return vnDate.getHours() * 60 + vnDate.getMinutes();
};

/**
 * Format HH:MM — dùng cho error messages.
 */
export const formatVietnamTime = (date: Date): string => {
  const year = date.getUTCFullYear();
  if (year === 1970 || year === 1969 || year === 2000) {
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  const vnDate = toZonedTime(date, TIME_ZONE);
  const hours = String(vnDate.getHours()).padStart(2, "0");
  const minutes = String(vnDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const parseTime = (timeStr?: string): Date => {
  if (!timeStr) {
    return new Date(0);
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(0); // 1970-01-01T00:00:00.000Z
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
};

