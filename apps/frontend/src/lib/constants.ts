import { BookingStatus, SportType } from "@/types";

export const SPORT_TYPE_LABELS: Record<SportType, string> = {
  [SportType.FOOTBALL]: "Bóng đá",
  [SportType.BASKETBALL]: "Bóng rổ",
  [SportType.TENNIS]: "Quần vợt",
  [SportType.BADMINTON]: "Cầu lông",
  [SportType.VOLLEYBALL]: "Bóng chuyền",
  [SportType.PICKLEBALL]: "Pickleball",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Chưa thanh toán",
  [BookingStatus.CONFIRMED]: "Đã xác nhận",
  [BookingStatus.CANCELED]: "Đã hủy",
  [BookingStatus.COMPLETED]: "Chờ xác nhận", // Sau khi thanh toán Stripe thành công
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800 hover:bg-green-200",
  [BookingStatus.CANCELED]: "bg-red-100 text-red-800 hover:bg-red-200",
  [BookingStatus.COMPLETED]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
};

export const RECURRENCE_TYPE_LABELS: Record<string, string> = {
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
};
