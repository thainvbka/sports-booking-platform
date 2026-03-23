import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Parse pricing rule time (string "HH:MM" hoặc Date từ Prisma @db.Time)
 * về số phút trong ngày.
 * - String "HH:MM": parse trực tiếp (face value).
 * - Date object: dùng getUTCHours vì Prisma lưu @db.Time face value trong UTC.
 */
export const parseRuleTimeToMinutes = (time: string | Date): number | null => {
  if (typeof time === "string") {
    const hhmm = time.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
    if (hhmm) return Number(hhmm[1]) * 60 + Number(hhmm[2]);
  }

  const d = new Date(time);
  if (Number.isNaN(d.getTime())) return null;
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};

/**
 * Parse booking timestamp (timestamptz từ server) về số phút theo giờ VN.
 * Dùng toZonedTime để đảm bảo đúng múi giờ bất kể browser setting.
 */
export const parseBookingTimeToVnMinutes = (time: string | Date): number => {
  const vnDate = toZonedTime(new Date(time), VN_TIMEZONE);
  return vnDate.getHours() * 60 + vnDate.getMinutes();
};

/**
 * Tạo ISO string từ ngày + giờ string "HH:MM" theo giờ VN.
 * Dùng fromZonedTime để đảm bảo đúng múi giờ bất kể browser setting.
 */
export const getIsoDateTimeVn = (baseDate: Date, timeStr: string): string => {
  const dateStr = format(baseDate, "yyyy-MM-dd");
  const [hours, minutes] = timeStr.split(":").map(Number);
  return fromZonedTime(
    `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
    VN_TIMEZONE,
  ).toISOString();
};

/**
 * Format số phút về string "HH:MM".
 */
export const formatMinutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};
