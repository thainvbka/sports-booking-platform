import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

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

  const year = d.getUTCFullYear();
  if (year === 1970 || year === 1969 || year === 2000) {
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }

  const zonedDate = toZonedTime(d, VN_TIMEZONE);
  return zonedDate.getHours() * 60 + zonedDate.getMinutes();
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

const formatDateObjToHhmm = (d: Date): string => {
  const year = d.getUTCFullYear();
  if (year === 1970 || year === 1969 || year === 2000) {
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  const zonedDate = toZonedTime(d, VN_TIMEZONE);
  const hours = String(zonedDate.getHours()).padStart(2, "0");
  const minutes = String(zonedDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Format time from backend (handles both string and Date)
 * Always returns 24-hour format HH:MM
 */
export const formatTime = (time: string | Date | unknown): string => {
  if (!time) return "--:--";

  if (typeof time === "string") {
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    if (/^\d{2}:\d{2}:\d{2}/.test(time)) return time.slice(0, 5);
    if (time.includes("T") || time.includes("-")) {
      const date = new Date(time);
      if (Number.isNaN(date.getTime())) return "--:--";
      return formatDateObjToHhmm(date);
    }
    return time.slice(0, 5);
  }

  if (time instanceof Date) {
    return formatDateObjToHhmm(time);
  }

  const str = String(time);
  if (str.includes(":")) {
    return str.slice(0, 5);
  }

  return "--:--";
};

/**
 * Format a date/timestamp to Vietnamese locale string.
 * Defaults format pattern to "dd/MM/yyyy".
 */
export const formatDateVn = (
  date: Date | string | number | null | undefined,
  formatPattern = "dd/MM/yyyy",
): string => {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const zonedDate = toZonedTime(d, VN_TIMEZONE);
  return format(zonedDate, formatPattern, { locale: vi });
};

/**
 * Calculates minutes between two time strings in "HH:MM" format.
 */
export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const a = sh * 60 + sm;
  let b = eh * 60 + em;
  if (b <= a) b += 24 * 60;
  return b - a;
}

/**
 * Formats a duration in minutes to a short human-readable string (e.g. 1h30, 45m, 2h).
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

