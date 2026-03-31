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
  [BookingStatus.COMPLETED]: "Chờ xác nhận",
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

export const RECURRING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đang hoạt động",
  COMPLETED: "Chờ xác nhận",
  CANCELED: "Đã hủy",
};

export const RECURRING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  CANCELED: "bg-red-100 text-red-800 hover:bg-red-200",
};

// User Status & Roles for Admin
export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Bị khóa",
  BANNED: "Bị cấm",
  SUSPENDED: "Tạm đình chỉ",
  PENDING: "Chờ duyệt",
  REJECTED: "Đã từ chối",
};

export const USER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 hover:bg-green-200",
  INACTIVE: "bg-red-100 text-red-800 hover:bg-red-200",
  BANNED: "bg-red-100 text-red-800 hover:bg-red-200",
  SUSPENDED: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  REJECTED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export const ROLE_LABELS: Record<string, string> = {
  PLAYER: "Người chơi",
  OWNER: "Chủ sân",
  ADMIN: "Quản trị viên",
};

export const ROLE_COLORS: Record<string, string> = {
  PLAYER: "bg-blue-100 text-blue-800",
  OWNER: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

// Complex Status
export const COMPLEX_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Đã từ chối",
  INACTIVE: "Tạm dừng",
};

export const COMPLEX_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  INACTIVE: "bg-orange-100 text-orange-800",
};
